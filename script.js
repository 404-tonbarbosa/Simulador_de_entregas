// Classe para representar um pacote
class Pacote {
    constructor(name, address, city, country) {
        this.name = name;
        this.address = address;
        this.city = city;
        this.country = country;
        this.timestamp = new Date();
        this.id = Date.now() + Math.floor(Math.random() * 1000);
    }
}

// Classe para a fila de entregas
class DeliveryQueue {
    constructor() {
        this.queue = [];
        this.history = [];
        this.deliveredCount = 0;
        this.userCity = 'Vila Velha'; // Default
    }

    // Adicionar pacote à fila
    enqueue(pacote) {
        this.queue.push(pacote);
        this.updateUI();
    }

    // Remover pacote da fila (entrega)
    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        const deliveredPacote = this.queue.shift();
        this.history.push(deliveredPacote);
        this.deliveredCount++;
        this.updateUI();
        return deliveredPacote;
    }

    // Verificar se a fila está vazia
    isEmpty() {
        return this.queue.length === 0;
    }

    // Obter o tamanho da fila
    size() {
        return this.queue.length;
    }

    // Limpar a fila
    clear() {
        this.queue = [];
        this.updateUI();
    }

    // Limpar o histórico
    clearHistory() {
        this.history = [];
        this.deliveredCount = 0;
        this.updateUI();
    }

    // Atualizar a localização do usuário
    setUserLocation(city) {
        this.userCity = city;
        document.getElementById('userLocation').textContent = `Polo ${city}`;
    }

    // Criar mapa
    createMap() {
        const map = document.getElementById('map');
        map.innerHTML = `
            <div class="map-roads">
                <div class="road-horizontal"></div>
                <div class="road-vertical"></div>
                <div class="intersection"></div>
            </div>
            <div class="depot">
                <i class="fas fa-warehouse"></i>
            </div>
            <div class="delivery-point">
                <i class="fas fa-home"></i>
            </div>
            <div class="route"></div>
            <div class="delivery-truck" id="deliveryTruck">
                <i class="fas fa-truck"></i>
            </div>
        `;
    }

    // Atualizar a interface do usuário
    updateUI() {
        const queueContainer = document.getElementById('queueContainer');
        const historyList = document.getElementById('historyList');
        const deliverButton = document.getElementById('deliverPackage');
        const clearQueueButton = document.getElementById('clearQueue');
        const statusMessage = document.getElementById('statusMessage');
        const queueCount = document.getElementById('queueCount');
        const deliveredCount = document.getElementById('deliveredCount');
        const totalCount = document.getElementById('totalCount');

        // Atualizar contadores
        queueCount.textContent = this.size();
        deliveredCount.textContent = this.deliveredCount;
        totalCount.textContent = this.deliveredCount + this.size();

        // Atualizar fila
        queueContainer.innerHTML = '';
        if (this.isEmpty()) {
            queueContainer.innerHTML = `
                <div class="queue-empty">
                    <i class="fas fa-box-open fa-2x" style="margin-bottom: 10px; color: #ccc;"></i>
                    <p>A fila de entregas está vazia</p>
                </div>
            `;
            deliverButton.disabled = true;
            clearQueueButton.disabled = true;
            statusMessage.innerHTML = '<i class="fas fa-info-circle"></i> Adicione pacotes à fila para começar as entregas!';
        } else {
            this.queue.forEach((pkg, index) => {
                const packageElement = document.createElement('div');
                packageElement.className = 'pacote';
                packageElement.innerHTML = `
                    <div class="pacote-info">
                        <div class="pacote-name">${pkg.name}</div>
                        <div class="pacote-address">${pkg.address}, ${pkg.city}, ${pkg.country}</div>
                    </div>
                    <div class="pacote-position">#${index + 1}</div>
                `;
                queueContainer.appendChild(packageElement);
            });
            deliverButton.disabled = false;
            clearQueueButton.disabled = false;
            statusMessage.innerHTML = `<i class="fas fa-info-circle"></i> Há ${this.size()} pacote(s) na fila de entrega.`;
        }

        // Atualizar histórico
        historyList.innerHTML = '';
        if (this.history.length === 0) {
            historyList.innerHTML = `
                <div class="history-empty">
                    <i class="fas fa-clipboard-check fa-2x" style="margin-bottom: 10px; color: #ccc;"></i>
                    <p>Nenhuma entrega realizada ainda</p>
                </div>
            `;
        } else {
            this.history.slice().reverse().forEach(pkg => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item delivered';
                const timeString = pkg.timestamp.toLocaleTimeString();
                const dateString = pkg.timestamp.toLocaleDateString();
                historyItem.innerHTML = `
                    <div class="history-header">
                        <div class="history-name">${pkg.name}</div>
                        <div class="history-time">${dateString} ${timeString}</div>
                    </div>
                    <div class="history-address">${pkg.address}, ${pkg.city}, ${pkg.country}</div>
                `;
                historyList.appendChild(historyItem);
            });
        }
    }
}

// Instanciar a fila de entregas
const deliveryQueue = new DeliveryQueue();

// Elementos DOM
const addPackageButton = document.getElementById('addPackage');
const deliverPackageButton = document.getElementById('deliverPackage');
const clearQueueButton = document.getElementById('clearQueue');
const clearHistoryButton = document.getElementById('clearHistory');
const statusMessage = document.getElementById('statusMessage');

// Função para obter geolocalização
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocalização não suportada'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    
                    // Usar API de geocodificação reversa para obter o nome da cidade
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        const city = data.city || data.locality || 'Localização desconhecida';
                        resolve(city);
                    } else {
                        // Fallback para cidades brasileiras baseadas na região
                        const cities = [
                            'Vila Velha', 'Vitória', 'Serra', 'Cariacica', 'Guarapari',
                            'Rio de Janeiro', 'São Paulo', 'Belo Horizonte', 'Salvador',
                            'Fortaleza', 'Recife', 'Porto Alegre', 'Curitiba', 'Brasília'
                        ];
                        const randomCity = cities[Math.floor(Math.random() * cities.length)];
                        resolve(randomCity);
                    }
                } catch (error) {
                    // Fallback para cidades do ES
                    const esCities = ['Vila Velha', 'Vitória', 'Serra', 'Cariacica', 'Guarapari'];
                    const randomCity = esCities[Math.floor(Math.random() * esCities.length)];
                    resolve(randomCity);
                }
            },
            (error) => {
                // Fallback em caso de erro de geolocalização
                const cities = ['Vila Velha', 'Vitória', 'Serra', 'Cariacica'];
                const randomCity = cities[Math.floor(Math.random() * cities.length)];
                resolve(randomCity);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 300000
            }
        );
    });
}

// Função para buscar um usuário aleatório da API
async function fetchRandomUser() {
    try {
        statusMessage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando destinatário...';
        
        const response = await fetch('https://randomuser.me/api/');
        
        if (!response.ok) {
            throw new Error(`Erro na conexão`);
        }
        
        const data = await response.json();
        const user = data.results[0];
        
        const name = `${user.name.first} ${user.name.last}`;
        const address = `${user.location.street.name}, ${user.location.street.number}`;
        const city = user.location.city;
        const country = user.location.country;
        
        return new Pacote(name, address, city, country);
        
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        
        // Retornar um pacote de fallback baseado na localização do usuário
        const userCity = deliveryQueue.userCity;
        const localAddresses = {
            'Vila Velha': [
                { name: 'João Silva', address: 'Av. Presidente Kennedy, 123', city: 'Vila Velha', country: 'Brasil' },
                { name: 'Ana Costa', address: 'Rua da Lama, 321', city: 'Vila Velha', country: 'Brasil' },
                { name: 'Carlos Souza', address: 'Av. Saturnino Rangel, 555', city: 'Vila Velha', country: 'Brasil' }
            ],
            'Vitória': [
                { name: 'Maria Santos', address: 'Rua das Flores, 456', city: 'Vitória', country: 'Brasil' },
                { name: 'Pedro Oliveira', address: 'Praça do Papa, 789', city: 'Vitória', country: 'Brasil' }
            ],
            'Serra': [
                { name: 'Paula Rodrigues', address: 'Av. Central, 111', city: 'Serra', country: 'Brasil' },
                { name: 'Ricardo Alves', address: 'Rua das Acácias, 222', city: 'Serra', country: 'Brasil' }
            ]
        };
        
        const addresses = localAddresses[userCity] || [
            { name: 'João Silva', address: 'Av. Principal, 123', city: userCity, country: 'Brasil' },
            { name: 'Maria Santos', address: 'Rua Central, 456', city: userCity, country: 'Brasil' }
        ];
        
        const randomUser = addresses[Math.floor(Math.random() * addresses.length)];
        return new Pacote(randomUser.name, randomUser.address, randomUser.city, randomUser.country);
    }
}

// Função para animar a entrega no mapa
function animateDelivery(callback) {
    const deliveryTruck = document.getElementById('deliveryTruck');
    
    // Resetar posição do caminhão
    deliveryTruck.style.left = '60px';
    
    // Animar o caminhão indo para o ponto de entrega
    setTimeout(() => {
        deliveryTruck.style.left = 'calc(100% - 120px)';
        
        // Simular tempo de entrega
        setTimeout(() => {
            // Animar o caminhão voltando
            deliveryTruck.style.left = '60px';
            
            // Chamar o callback quando a animação terminar
            setTimeout(callback, 1500);
        }, 1000);
    }, 100);
}

// Event Listeners
addPackageButton.addEventListener('click', async () => {
    const newPacote = await fetchRandomUser();
    deliveryQueue.enqueue(newPacote);
    statusMessage.innerHTML = `<i class="fas fa-check-circle"></i> Pacote para <strong>${newPacote.name}</strong> adicionado à fila!`;
});

deliverPackageButton.addEventListener('click', () => {
    if (!deliveryQueue.isEmpty()) {
        const nextPacote = deliveryQueue.queue[0];
        statusMessage.innerHTML = `<i class="fas fa-truck-moving"></i> Entregando pacote para <strong>${nextPacote.name}</strong>...`;
        
        // Desabilitar botões durante a entrega
        addPackageButton.disabled = true;
        deliverPackageButton.disabled = true;
        clearQueueButton.disabled = true;
        clearHistoryButton.disabled = true;
        
        // Animar a entrega
        animateDelivery(() => {
            // Realizar a entrega (remover da fila)
            const deliveredPacote = deliveryQueue.dequeue();
            statusMessage.innerHTML = `<i class="fas fa-check-double"></i> Pacote entregue para <strong>${deliveredPacote.name}</strong> em ${deliveredPacote.city}, ${deliveredPacote.country}!`;
            
            // Reabilitar botões
            addPackageButton.disabled = false;
            clearHistoryButton.disabled = false;
            if (!deliveryQueue.isEmpty()) {
                deliverPackageButton.disabled = false;
                clearQueueButton.disabled = false;
            }
        });
    }
});

clearQueueButton.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar toda a fila de entregas?')) {
        deliveryQueue.clear();
        statusMessage.innerHTML = '<i class="fas fa-broom"></i> Fila de entregas limpa!';
    }
});

clearHistoryButton.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar o histórico de entregas?')) {
        deliveryQueue.clearHistory();
        statusMessage.innerHTML = '<i class="fas fa-history"></i> Histórico de entregas limpo!';
    }
});

// Inicializar a aplicação
async function initializeApp() {
    try {
        // Obter localização do usuário
        const userCity = await getUserLocation();
        deliveryQueue.setUserLocation(userCity);
        
        // Criar mapa
        deliveryQueue.createMap();
        
        // Inicializar interface
        deliveryQueue.updateUI();
        
        statusMessage.innerHTML = `<i class="fas fa-check-circle"></i> Sistema inicializado! Localização: ${userCity}`;
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        deliveryQueue.setUserLocation('Vila Velha');
        deliveryQueue.createMap();
        deliveryQueue.updateUI();
        statusMessage.innerHTML = '<i class="fas fa-info-circle"></i> Sistema inicializado com localização padrão';
    }
}

// Iniciar a aplicação quando a página carregar
document.addEventListener('DOMContentLoaded', initializeApp);