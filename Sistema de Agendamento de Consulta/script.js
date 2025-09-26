// --- Dados de Simulação ---
const especialidades = [
    { id: 1, nome: "Clínica Geral" },
    { id: 2, nome: "Pediatria" },
    { id: 3, nome: "Ginecologia" },
    { id: 4, nome: "Odontologia" }
];

const medicos = [
    { id: 101, nome: "Dr. João Silva", especialidadeId: 1 },
    { id: 102, nome: "Dra. Maria Souza", especialidadeId: 2 },
    { id: 103, nome: "Dr. Pedro Santos", especialidadeId: 3 },
    { id: 104, nome: "Dra. Ana Costa", especialidadeId: 4 },
    { id: 105, nome: "Dr. Carlos Oliveira", especialidadeId: 1 }
];

let disponibilidades = [
    { medicoId: 101, data: "2025-10-20", horario: "10:00", disponivel: true },
    { medicoId: 101, data: "2025-10-20", horario: "11:00", disponivel: true },
    { medicoId: 102, data: "2025-10-21", horario: "14:30", disponivel: true },
    { medicoId: 103, data: "2025-10-22", horario: "09:00", disponivel: true },
    { medicoId: 104, data: "2025-10-23", horario: "16:00", disponivel: true },
    { medicoId: 105, data: "2025-10-20", horario: "15:00", disponivel: true }
];

const pacientes = [];
const agendamentosGlobais = []; // Todos os agendamentos feitos no sistema

let proximoPacienteId = 1;
let pacienteLogado = null;
let especialidadeSelecionadaId = null;
let medicoSelecionadoId = null;

// --- Referências do DOM ---
const authSection = document.getElementById('auth-section');
const cadastroForm = document.getElementById('cadastro-form');
const loginForm = document.getElementById('login-form');
const authMessage = document.getElementById('auth-message');

const dashboardSection = document.getElementById('dashboard-section');
const userDisplayName = document.getElementById('user-display-name');
const pacienteAgendamentosDiv = document.getElementById('paciente-agendamentos');

const especialidadesListDiv = document.getElementById('especialidades-list');
const medicosListDiv = document.getElementById('medicos-list');
const horariosListDiv = document.getElementById('horarios-list');
const agendamentoMessage = document.getElementById('agendamento-message');

const passo1 = document.getElementById('passo-1');
const passo2 = document.getElementById('passo-2');
const passo3 = document.getElementById('passo-3');

const showCadastroBtn = document.getElementById('show-cadastro');
const showLoginBtn = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');

// --- Funções Auxiliares de UI ---
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
}

function clearMessage(element) {
    element.textContent = '';
    element.className = 'message';
    element.style.display = 'none';
}

function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

function updateNavButtons() {
    if (pacienteLogado) {
        showCadastroBtn.style.display = 'none';
        showLoginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    } else {
        showCadastroBtn.style.display = 'inline-block';
        showLoginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
}

// --- Lógica do Sistema ---

function cadastrarPaciente(nome, email, senha) {
    if (pacientes.find(p => p.email === email)) {
        return { sucesso: false, mensagem: "Erro: Email já cadastrado." };
    }

    const novoPaciente = {
        id: proximoPacienteId++,
        nome,
        email,
        senha,
        agendamentos: []
    };

    pacientes.push(novoPaciente);
    return { sucesso: true, mensagem: `Paciente ${nome} cadastrado com sucesso!` };
}

function fazerLogin(email, senha) {
    const paciente = pacientes.find(p => p.email === email && p.senha === senha);
    if (paciente) {
        return { sucesso: true, mensagem: `Bem-vindo(a), ${paciente.nome}!`, paciente };
    } else {
        return { sucesso: false, mensagem: "Erro: Email ou senha inválidos." };
    }
}

function renderEspecialidades() {
    especialidadesListDiv.innerHTML = '';
    especialidades.forEach(esp => {
        const button = document.createElement('button');
        button.textContent = esp.nome;
        button.onclick = () => selectEspecialidade(esp.id);
        especialidadesListDiv.appendChild(button);
    });
    passo1.style.display = 'block';
    passo2.style.display = 'none';
    passo3.style.display = 'none';
    clearMessage(document.getElementById('especialidade-message'));
    clearMessage(document.getElementById('medico-message'));
    clearMessage(document.getElementById('horario-message'));
    clearMessage(agendamentoMessage);
}

function selectEspecialidade(id) {
    especialidadeSelecionadaId = id;
    renderMedicos(id);
    passo1.style.display = 'none';
    passo2.style.display = 'block';
    showMessage(document.getElementById('especialidade-message'), `Especialidade selecionada: ${especialidades.find(e => e.id === id).nome}`, 'info');
}

function renderMedicos(especialidadeId) {
    medicosListDiv.innerHTML = '';
    const medicosFiltrados = medicos.filter(m => m.especialidadeId === especialidadeId);

    if (medicosFiltrados.length === 0) {
        medicosListDiv.innerHTML = '<p>Nenhum médico disponível para esta especialidade.</p>';
        return;
    }

    medicosFiltrados.forEach(med => {
        const button = document.createElement('button');
        button.textContent = med.nome;
        button.onclick = () => selectMedico(med.id);
        medicosListDiv.appendChild(button);
    });
}

function selectMedico(id) {
    medicoSelecionadoId = id;
    renderHorarios(id);
    passo2.style.display = 'none';
    passo3.style.display = 'block';
    showMessage(document.getElementById('medico-message'), `Médico selecionado: ${medicos.find(m => m.id === id).nome}`, 'info');
}

function renderHorarios(medicoId) {
    horariosListDiv.innerHTML = '';
    const disponibilidadeMedico = disponibilidades.filter(d => d.medicoId === medicoId && d.disponivel);

    if (disponibilidadeMedico.length === 0) {
        horariosListDiv.innerHTML = '<p>Nenhum horário disponível para este médico.</p>';
        return;
    }

    disponibilidadeMedico.forEach((disp, index) => {
        const button = document.createElement('button');
        button.textContent = `Data: ${disp.data} | Horário: ${disp.horario}`;
        button.onclick = () => agendarConsulta(disp);
        horariosListDiv.appendChild(button);
    });
}

function agendarConsulta(horarioEscolhido) {
    const indexOriginal = disponibilidades.findIndex(d => 
        d.medicoId === horarioEscolhido.medicoId && 
        d.data === horarioEscolhido.data && 
        d.horario === horarioEscolhido.horario
    );

    if (indexOriginal === -1 || !disponibilidades[indexOriginal].disponivel) {
        showMessage(agendamentoMessage, "Erro: Horário não disponível ou já agendado.", 'error');
        return;
    }

    disponibilidades[indexOriginal].disponivel = false;

    const medico = medicos.find(m => m.id === horarioEscolhido.medicoId);
    const especialidade = especialidades.find(e => e.id === medico.especialidadeId);

    const novoAgendamento = {
        id: agendamentosGlobais.length + 1,
        pacienteId: pacienteLogado.id,
        medico: medico.nome,
        especialidade: especialidade.nome,
        data: horarioEscolhido.data,
        horario: horarioEscolhido.horario,
        status: "Agendado"
    };

    agendamentosGlobais.push(novoAgendamento);
    pacienteLogado.agendamentos.push(novoAgendamento);

    showMessage(agendamentoMessage, `Consulta agendada com sucesso! Protocolo #${novoAgendamento.id}`, 'success');
    
    // Volta para o início do agendamento e atualiza os agendamentos do paciente
    renderPacienteAgendamentos();
    renderEspecialidades(); 
}

function renderPacienteAgendamentos() {
    pacienteAgendamentosDiv.innerHTML = '';
    if (pacienteLogado && pacienteLogado.agendamentos.length > 0) {
        pacienteLogado.agendamentos.forEach(ag => {
            const div = document.createElement('div');
            div.innerHTML = `
                <p><strong>Protocolo:</strong> #${ag.id}</p>
                <p><strong>Especialidade:</strong> ${ag.especialidade}</p>
                <p><strong>Médico:</strong> ${ag.medico}</p>
                <p><strong>Data:</strong> ${ag.data}</p>
                <p><strong>Horário:</strong> ${ag.horario}</p>
                <p><strong>Status:</strong> ${ag.status}</p>
            `;
            pacienteAgendamentosDiv.appendChild(div);
        });
    } else {
        pacienteAgendamentosDiv.innerHTML = '<p>Você não possui agendamentos.</p>';
    }
}

function loginSuccess(paciente) {
    pacienteLogado = paciente;
    userDisplayName.textContent = pacienteLogado.nome;
    showSection('dashboard-section');
    renderEspecialidades(); // Inicia o fluxo de agendamento
    renderPacienteAgendamentos();
    updateNavButtons();
}

function logout() {
    pacienteLogado = null;
    especialidadeSelecionadaId = null;
    medicoSelecionadoId = null;
    showSection('auth-section');
    cadastroForm.style.display = 'block';
    loginForm.style.display = 'none';
    clearMessage(authMessage);
    updateNavButtons();
}

// --- Event Listeners ---

// Troca entre formulários de Cadastro e Login
document.getElementById('link-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    cadastroForm.style.display = 'none';
    loginForm.style.display = 'block';
    clearMessage(authMessage);
});

document.getElementById('link-to-cadastro').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    cadastroForm.style.display = 'block';
    clearMessage(authMessage);
});

showCadastroBtn.addEventListener('click', () => {
    showSection('auth-section');
    cadastroForm.style.display = 'block';
    loginForm.style.display = 'none';
    clearMessage(authMessage);
});

showLoginBtn.addEventListener('click', () => {
    showSection('auth-section');
    cadastroForm.style.display = 'none';
    loginForm.style.display = 'block';
    clearMessage(authMessage);
});

// Botão de Cadastro
document.getElementById('cadastrar-btn').addEventListener('click', () => {
    const nome = document.getElementById('cadastro-nome').value;
    const email = document.getElementById('cadastro-email').value;
    const senha = document.getElementById('cadastro-senha').value;

    if (!nome || !email || !senha) {
        showMessage(authMessage, "Por favor, preencha todos os campos.", 'error');
        return;
    }

    const resultado = cadastrarPaciente(nome, email, senha);
    if (resultado.sucesso) {
        showMessage(authMessage, resultado.mensagem + " Agora você pode fazer login.", 'success');
        document.getElementById('cadastro-nome').value = '';
        document.getElementById('cadastro-email').value = '';
        document.getElementById('cadastro-senha').value = '';
        cadastroForm.style.display = 'none'; // Leva para o login após cadastro
        loginForm.style.display = 'block';
    } else {
        showMessage(authMessage, resultado.mensagem, 'error');
    }
});

// Botão de Login
document.getElementById('login-btn').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    if (!email || !senha) {
        showMessage(authMessage, "Por favor, preencha todos os campos.", 'error');
        return;
    }

    const resultado = fazerLogin(email, senha);
    if (resultado.sucesso) {
        loginSuccess(resultado.paciente);
        document.getElementById('login-email').value = '';
        document.getElementById('login-senha').value = '';
    } else {
        showMessage(authMessage, resultado.mensagem, 'error');
    }
});

// Botão de Logout
logoutBtn.addEventListener('click', logout);

// Navegação de volta nos passos de agendamento
document.getElementById('back-to-especialidades').addEventListener('click', () => {
    renderEspecialidades();
    clearMessage(document.getElementById('medico-message'));
});

document.getElementById('back-to-medicos').addEventListener('click', () => {
    selectEspecialidade(especialidadeSelecionadaId); // Redireciona para listar médicos da especialidade
    clearMessage(document.getElementById('horario-message'));
});

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    showSection('auth-section'); // Começa na tela de autenticação
    cadastroForm.style.display = 'block'; // Exibe o formulário de cadastro por padrão
    updateNavButtons();
});