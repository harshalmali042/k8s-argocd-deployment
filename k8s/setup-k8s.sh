#!/bin/bash

set -e

echo "=========================================="
echo " Kubernetes Single Node Setup"
echo " Ubuntu + containerd + kubeadm + Calico"
echo " Kubernetes v1.34"
echo "=========================================="

# --------------------------------------------------
# 1. Basic checks
# --------------------------------------------------

if [ "$EUID" -eq 0 ]; then
    echo "Please run this script as a normal user with sudo access."
    exit 1
fi

if ! command -v apt-get >/dev/null 2>&1; then
    echo "This script requires an Ubuntu/Debian based OS."
    exit 1
fi

echo ""
echo "[1/14] Checking system..."

echo "Hostname : $(hostname)"
echo "CPU      : $(nproc)"
echo "Memory   :"
free -h

# Detect private IP used for outbound traffic
NODE_IP=$(ip -4 route get 8.8.8.8 | awk '{for(i=1;i<=NF;i++) if($i=="src"){print $(i+1); exit}}')

if [ -z "$NODE_IP" ]; then
    echo "ERROR: Could not detect private IP."
    exit 1
fi

echo "Node IP  : $NODE_IP"

# --------------------------------------------------
# 2. Set hostname
# --------------------------------------------------

echo ""
echo "[2/14] Setting hostname..."

sudo hostnamectl set-hostname argo-master

echo "Hostname set to:"
hostname

# --------------------------------------------------
# 3. Update packages
# --------------------------------------------------

echo ""
echo "[3/14] Updating Ubuntu packages..."

sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    curl \
    gpg \
    apt-transport-https

# --------------------------------------------------
# 4. Disable swap
# --------------------------------------------------

echo ""
echo "[4/14] Disabling swap..."

sudo swapoff -a

# Comment swap entries in fstab
sudo sed -i '/[[:space:]]swap[[:space:]]/ s/^/#/' /etc/fstab

echo "Swap status:"
swapon --show || true

# --------------------------------------------------
# 5. Kernel modules
# --------------------------------------------------

echo ""
echo "[5/14] Configuring kernel modules..."

sudo modprobe overlay
sudo modprobe br_netfilter

sudo tee /etc/modules-load.d/k8s.conf > /dev/null <<EOF
overlay
br_netfilter
EOF

# --------------------------------------------------
# 6. Kubernetes networking
# --------------------------------------------------

echo ""
echo "[6/14] Configuring Kubernetes networking..."

sudo tee /etc/sysctl.d/k8s.conf > /dev/null <<EOF
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward = 1
EOF

sudo sysctl --system

echo ""
echo "IP forwarding:"
sysctl net.ipv4.ip_forward

# --------------------------------------------------
# 7. Install containerd
# --------------------------------------------------

echo ""
echo "[7/14] Installing containerd..."

sudo apt-get install -y containerd

sudo mkdir -p /etc/containerd

containerd config default | sudo tee /etc/containerd/config.toml > /dev/null

# Use systemd cgroup driver
sudo sed -i \
's/SystemdCgroup = false/SystemdCgroup = true/' \
/etc/containerd/config.toml

sudo systemctl restart containerd
sudo systemctl enable containerd

echo ""
echo "Containerd status:"
sudo systemctl is-active containerd

# --------------------------------------------------
# 8. Kubernetes repository
# --------------------------------------------------

echo ""
echo "[8/14] Configuring Kubernetes v1.34 repository..."

sudo mkdir -p -m 755 /etc/apt/keyrings

sudo rm -f /etc/apt/keyrings/kubernetes-apt-keyring.gpg

curl -fsSL \
https://pkgs.k8s.io/core:/stable:/v1.34/deb/Release.key \
| sudo gpg --dearmor \
-o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.34/deb/ /' \
| sudo tee /etc/apt/sources.list.d/kubernetes.list > /dev/null

sudo apt-get update

# --------------------------------------------------
# 9. Install Kubernetes
# --------------------------------------------------

echo ""
echo "[9/14] Installing kubeadm, kubelet and kubectl..."

sudo apt-get install -y kubelet kubeadm kubectl

sudo apt-mark hold kubelet kubeadm kubectl

sudo systemctl enable kubelet

echo ""
echo "Installed versions:"
echo "-------------------"
kubeadm version
kubectl version --client
kubelet --version

# --------------------------------------------------
# 10. Initialize Kubernetes
# --------------------------------------------------

echo ""
echo "[10/14] Initializing Kubernetes control plane..."

# Don't accidentally initialize an already configured cluster
if [ -f /etc/kubernetes/admin.conf ]; then
    echo ""
    echo "ERROR: Kubernetes already appears to be initialized."
    echo "Found /etc/kubernetes/admin.conf"
    echo ""
    echo "If this is an old/broken cluster, reset it manually first:"
    echo ""
    echo "sudo kubeadm reset -f"
    echo ""
    exit 1
fi

sudo kubeadm init \
    --apiserver-advertise-address="$NODE_IP" \
    --pod-network-cidr=192.168.0.0/16

echo ""
echo "Kubernetes control plane initialized."

# --------------------------------------------------
# 11. Configure kubectl
# --------------------------------------------------

echo ""
echo "[11/14] Configuring kubectl..."

mkdir -p "$HOME/.kube"

sudo cp -f /etc/kubernetes/admin.conf "$HOME/.kube/config"

sudo chown "$(id -u):$(id -g)" "$HOME/.kube/config"

export KUBECONFIG="$HOME/.kube/config"

echo ""
echo "kubectl test:"
kubectl get nodes

# --------------------------------------------------
# 12. Install Calico
# --------------------------------------------------

echo ""
echo "[12/14] Installing Calico CNI..."

CALICO_VERSION="v3.32.1"

echo "Installing Calico version $CALICO_VERSION"

kubectl create -f \
https://raw.githubusercontent.com/projectcalico/calico/${CALICO_VERSION}/manifests/v1_crd_projectcalico_org.yaml

kubectl create -f \
https://raw.githubusercontent.com/projectcalico/calico/${CALICO_VERSION}/manifests/tigera-operator.yaml

kubectl create -f \
https://raw.githubusercontent.com/projectcalico/calico/${CALICO_VERSION}/manifests/custom-resources.yaml

echo ""
echo "Calico resources created."

# --------------------------------------------------
# 13. Wait for Calico / Kubernetes
# --------------------------------------------------

echo ""
echo "[13/14] Waiting for Kubernetes networking..."

echo "Waiting 20 seconds for Calico..."
sleep 20

echo ""
echo "Current pods:"
kubectl get pods -A

# --------------------------------------------------
# 14. Allow workloads on control-plane
# --------------------------------------------------

echo ""
echo "[14/14] Removing control-plane taint..."

kubectl taint nodes --all node-role.kubernetes.io/control-plane- || true

kubectl taint nodes --all node-role.kubernetes.io/master- || true

echo ""
echo "=========================================="
echo " Kubernetes setup completed"
echo "=========================================="

echo ""
echo "Node:"
kubectl get nodes -o wide

echo ""
echo "Pods:"
kubectl get pods -A

echo ""
echo "Cluster information:"
kubectl cluster-info

echo ""
echo "Private node IP:"
echo "$NODE_IP"

echo ""
echo "=========================================="
echo " IMPORTANT"
echo "=========================================="
echo ""
echo "Your Kubernetes API server is:"
echo "https://$NODE_IP:6443"
echo ""
echo "kubectl configuration:"
echo "$HOME/.kube/config"
echo ""
echo "Next useful command:"
echo "kubectl get nodes -o wide"
echo ""
echo "=========================================="
