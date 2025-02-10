import React, { useState, useEffect } from "react";
import {
    Box, FormControl, FormLabel, Input, Select, Button, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Grid, GridItem, useColorModeValue, useToast, Flex, IconButton, Modal, ModalOverlay,
    ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Table, Thead, Tbody, Tr, Th, Td, Spinner, Text,
} from "@chakra-ui/react";
import { ArrowForwardIcon, ArrowBackIcon, SearchIcon } from "@chakra-ui/icons";
import axios from "axios";

const FichasEntrada = () => {
    const today = new Date().toISOString().split("T")[0];
    const [formData, setFormData] = useState({
        cpfCnpj: "",
        obraName: "",
        clientName: "",
        cep: "",
        address: "",
        bairro: "",
        ufClient: "",
        cityClient: "",
        obraType: "",
        ufObra: "",
        cityObra: "",
        objetivo: "",
        pagamento: "",
        descricao: "",
        frete: "",
        montagem: "",
        dataEntrada: "",
        solicitacaoEntrega: "",
        previsaoContratacao: "",
        dataEntrada: today,
        solicitacaoEntrega: "",
        previsaoContratacao: "",
        inicioFornecimento: "",
    });

    const [activeTab, setActiveTab] = useState(0); // Controle da aba ativ
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const toast = useToast();

    const [ufs, setUfs] = useState([]); // Lista de UFs disponíveis
    const fetchUfs = async () => {
        try {
            const token = sessionStorage.getItem("token"); // Recupera o token da sessão
            const response = await axios.get("http://192.168.0.249:5000/api/crm/ufs", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUfs(response.data); // Atualiza o estado com a lista de UFs
        } catch (error) {
            console.error("Erro ao buscar UFs:", error);
            toast({
                title: "Erro ao buscar UFs.",
                description: "Não foi possível carregar as UFs.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Chame a função ao montar o componente
    useEffect(() => {
        fetchUfs();
    }, []);

    const [cidades, setCidades] = useState([]); // Lista de cidades disponíveis para a UF selecionada
    const fetchCidades = async (uf) => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(`http://192.168.0.249:5000/api/crm/cidades/${uf}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCidades(response.data); // Atualiza o estado com a lista de cidades
        } catch (error) {
            console.error("Erro ao buscar cidades:", error);
            toast({
                title: "Erro ao buscar cidades.",
                description: "Não foi possível carregar as cidades.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };
    const handleUfChange = (e) => {
        const uf = e.target.value;
        setFormData((prev) => ({ ...prev, ufClient: uf, cityClient: "" })); // Atualiza UF e reseta a cidade
        fetchCidades(uf); // Busca as cidades para a UF selecionada
    };



    // Estilos de tema
    const pageBgColor = useColorModeValue("secondaryGray.300", "navy.900");
    const cardBgColor = useColorModeValue("white", "navy.800");
    const textColor = useColorModeValue("secondaryGray.900", "white");
    const inputBgColor = useColorModeValue("secondaryGray.300", "navy.700");
    const buttonBg = useColorModeValue("brand.500", "brand.400");
    const buttonHover = useColorModeValue("brand.600", "brand.300");

    const navbarHeight = "80px";

    const formatCpfCnpj = (value) => {
        if (!value) return "";
        if (value.length === 11) {
            return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        } else if (value.length === 14) {
            return value.replace(
                /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
                "$1.$2.$3/$4-$5"
            );
        }
        return value;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        toast({
            title: "Ficha cadastrada com sucesso!",
            description: "Os dados foram salvos.",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    const goToNextTab = () => {
        if (activeTab < 2) {
            setActiveTab((prev) => prev + 1);
        }
    };

    const goToPreviousTab = () => {
        if (activeTab > 0) {
            setActiveTab((prev) => prev - 1);
        }
    };

    // Busca clientes ativos no backend
    const fetchClientes = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem("token"); // Recupera o token da sessão
            const response = await axios.get("http://192.168.0.249:5000/api/crm/clientes", {
                headers: {
                    Authorization: `Bearer ${token}`, // Adiciona o token no header
                },
            });

            setClientes(response.data); // Define os clientes
            setFilteredClientes(response.data); // Define os clientes filtrados com todos os clientes
        } catch (error) {
            toast({
                title: "Erro ao buscar clientes.",
                description: "Não foi possível carregar os dados.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const selectCliente = async (cpfCnpj) => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(`http://192.168.0.249:5000/api/crm/clientes/${cpfCnpj}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const cliente = response.data;

            setFormData((prev) => ({
                ...prev,
                cpfCnpj,
                clientName: cliente.nome,
                cep: cliente.cep,
                address: cliente.endereco,
                bairro: cliente.bairro,
                ufClient: cliente.uf,
                cityClient: cliente.cidade,
                contatoCliente: cliente.contato,
                funcaoCliente: cliente.funcao,
                emailCliente: cliente.email,
                celularCliente: cliente.telefone,
                telefoneCliente: cliente.fone,
                InscricaoEstadual: cliente.ie,
            }));

            // Busca as cidades para a UF do cliente selecionado
            fetchCidades(cliente.uf);

            closeModal();
        } catch (error) {
            console.error("Erro ao buscar informações do cliente:", error);
            toast({
                title: "Erro ao buscar cliente.",
                description: "Não foi possível carregar os dados do cliente selecionado.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };



    // Abre o modal
    const openModal = () => {
        fetchClientes(); // Busca os dados e sincroniza o estado
        setIsModalOpen(true);
    };



    // Filtro de busca
    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = clientes.filter(
            (cliente) =>
                cliente.nome.toLowerCase().includes(query.toLowerCase()) ||
                formatCpfCnpj(cliente.cpfcnpj)
                    .toLowerCase()
                    .includes(query.toLowerCase())
        );
        setFilteredClientes(filtered);
    };


    // Fecha o modal
    const closeModal = () => {
        setIsModalOpen(false);
    };



    // aqui a parte do tipo da obra: 
    const [tiposObra, setTiposObra] = useState([]); // Inicializar como array vazio
    const [tabConfig, setTabConfig] = useState({
        showDescricao: true,
        showObservacoes: true,
    }); // Controle das abas
    const fetchTiposObra = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get("http://192.168.0.249:5000/api/crm/tipoobras", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (Array.isArray(response.data)) {
                setTiposObra(response.data); // Atualiza somente se for um array
            } else {
                console.error("Resposta inesperada:", response.data);
                setTiposObra([]); // Reseta para array vazio se não for um array
            }
        } catch (error) {
            console.error("Erro ao buscar tipos de obra:", error);
            setTiposObra([]); // Reseta em caso de erro
            toast({
                title: "Erro ao buscar tipos de obra.",
                description: "Não foi possível carregar os tipos de obra.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        fetchTiposObra();
    }, []);

    const handleTipoObraChange = (e) => {
        const selectedTipo = e.target.value;

        // Define lógica para ajustar as abas
        if (["Obra", "Habitacional"].includes(selectedTipo)) {
            setTabConfig({ showDescricao: true, showObservacoes: true });
        } else if (["Lajes", "Aduelas", "Estacas", "Mercantil"].includes(selectedTipo)) {
            setTabConfig({ showDescricao: false, showObservacoes: true });
        }

        // Atualiza o tipo de obra no estado do formulário
        setFormData((prev) => ({ ...prev, obraType: selectedTipo }));

        // Reseta a aba ativa para a primeira aba válida
        setActiveTab(0);
    };



    return (
        <Box
            bg={pageBgColor}
            minHeight="100vh"
            marginTop={navbarHeight} // Offset para o conteúdo começar abaixo do Navbar
            p={4}
        >
            {/* Botão de Salvar no canto superior direito */}
            <Flex justify="flex-end" mb={4}>
                <Button
                    bg={buttonBg}
                    color="white"
                    _hover={{ bg: buttonHover }}
                    onClick={handleSubmit}
                >
                    Salvar nova ficha
                </Button>
            </Flex>
            <Box
                bg={cardBgColor}
                borderRadius="16px"
                p={8}
                maxWidth="100%"
                mx="auto"
                boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)"
            >
                <Heading as="h1" size="lg" mb={6} color={textColor} textAlign="center">
                    Cadastro de Ficha de Entrada
                </Heading>

                {/* Tabs para navegação */}
                <Tabs
                    variant="enclosed"
                    index={activeTab} // Sincroniza a aba ativa com o estado
                    onChange={(index) => setActiveTab(index)} // Atualiza o estado quando a aba muda
                >
                    <TabList
                        whiteSpace="nowrap"
                        display="flex"
                        flexWrap={{ base: "wrap", md: "nowrap" }}
                        gap={{ base: 2, md: 4 }}
                    >
                        <Tab _selected={{ color: buttonBg }}>Cliente</Tab>
                        {tabConfig.showDescricao && <Tab _selected={{ color: buttonBg }}>Descrição do Fornecimento</Tab>}
                        {tabConfig.showObservacoes && <Tab _selected={{ color: buttonBg }}>Observações</Tab>}
                    </TabList>

                    <TabPanels>
                        {/* Tab 1: Informações do Cliente e da Obra */}
                        <TabPanel>
                            <form onSubmit={handleSubmit}>
                                <Grid
                                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                                    gap={6}
                                >
                                    {/* Coluna 1: Informações do Cliente */}
                                    <GridItem>
                                        <Heading as="h2" size="md" color={textColor} mb={4}>
                                            Informações do Cliente
                                        </Heading>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>CPF/CNPJ</FormLabel>
                                            <Flex>
                                                <Input
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Digite ou selecione"
                                                    name="cpfCnpj"
                                                    value={formData.cpfCnpj}
                                                    onChange={handleChange}
                                                />
                                                <IconButton
                                                    icon={<SearchIcon />}
                                                    ml={2}
                                                    onClick={openModal}
                                                    aria-label="Buscar cliente"
                                                />
                                            </Flex>
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Nome do Cliente</FormLabel>
                                            <Input
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Digite o nome do cliente"
                                                name="clientName"
                                                value={formData.clientName}
                                                onChange={handleChange}
                                                _placeholder={{ color: "gray.400" }}
                                            />
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>CEP do Cliente</FormLabel>
                                            <Input
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Digite o CEP"
                                                name="cep"
                                                value={formData.cep}
                                                onChange={handleChange}
                                                _placeholder={{ color: "gray.400" }}
                                            />
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Endereço do Cliente</FormLabel>
                                            <Input
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Digite o endereço"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                _placeholder={{ color: "gray.400" }}
                                            />
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Bairro do Cliente</FormLabel>
                                            <Input
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Digite o bairro"
                                                name="bairro"
                                                value={formData.bairro}
                                                onChange={handleChange}
                                                _placeholder={{ color: "gray.400" }}
                                            />
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>UF do Cliente</FormLabel>
                                            <Select
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Selecione uma UF"
                                                name="ufClient"
                                                value={formData.ufClient}
                                                onChange={handleUfChange} // Atualiza o estado e carrega as cidades correspondentes
                                            >
                                                {ufs.map((uf) => (
                                                    <option key={uf.uf} value={uf.uf}>
                                                        {uf.uf}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Cidade do Cliente</FormLabel>
                                            <Select
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Selecione uma cidade"
                                                name="cityClient"
                                                value={formData.cityClient}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({ ...prev, cityClient: e.target.value }))
                                                }
                                                isDisabled={!formData.ufClient} // Desabilita o campo se a UF não estiver selecionada
                                            >
                                                {cidades.map((cidade) => (
                                                    <option key={cidade.idcidade} value={cidade.nome}>
                                                        {cidade.nome}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Contribuinte ICMS</FormLabel>
                                            <Select
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="---"
                                                name="icmsCliente"
                                                value={formData.icmsCliente}
                                                onChange={handleChange}
                                            >
                                                <option>Sim</option>
                                                <option>Não</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Inscrição Estadual</FormLabel>
                                            <Input
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Digite a Inscrição Estadual"
                                                name="InscricaoEstadual"
                                                value={formData.InscricaoEstadual}
                                                onChange={handleChange}
                                                _placeholder={{ color: "gray.400" }}
                                            />
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Contato</FormLabel>
                                            <Input
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Digite o Contato"
                                                name="contatoCliente"
                                                value={formData.contatoCliente}
                                                onChange={handleChange}
                                                _placeholder={{ color: "gray.400" }}
                                            />
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Função</FormLabel>
                                            <Input
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Digite a Função"
                                                name="funcaoCliente"
                                                value={formData.funcaoCliente}
                                                onChange={handleChange}
                                                _placeholder={{ color: "gray.400" }}
                                            />
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>E-mail</FormLabel>
                                            <Input
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Digite o e-mail"
                                                name="emailCliente"
                                                value={formData.emailCliente}
                                                onChange={handleChange}
                                                _placeholder={{ color: "gray.400" }}
                                            />
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Celular</FormLabel>
                                            <Input
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Digite o número do Celular"
                                                name="celularCliente"
                                                value={formData.celularCliente}
                                                onChange={handleChange}
                                                _placeholder={{ color: "gray.400" }}
                                            />
                                        </FormControl>
                                        <FormControl mb={4}>
                                            <FormLabel color={textColor}>Telefone</FormLabel>
                                            <Input
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Digite o número do Telefone Fixo"
                                                name="telefoneCliente"
                                                value={formData.telefoneCliente}
                                                onChange={handleChange}
                                                _placeholder={{ color: "gray.400" }}
                                            />
                                        </FormControl>
                                    </GridItem>

                                    {/* Coluna 2: Informações da Obra */}
                                    <GridItem>
                                        <Heading as="h2" size="md" color={textColor} mb={4}>
                                            Informações da Obra
                                        </Heading>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Nome da Obra</FormLabel>
                                            <Input
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Digite o nome da obra"
                                                name="obraName"
                                                value={formData.obraName}
                                                onChange={handleChange}
                                                _placeholder={{ color: "gray.400" }}
                                            />
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Tipo de Obra</FormLabel>
                                            <Select
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Selecione um tipo"
                                                name="obraType"
                                                value={formData.obraType}
                                                onChange={handleTipoObraChange}
                                            >
                                                {Array.isArray(tiposObra) &&
                                                    tiposObra.map((tipo) => (
                                                        <option key={tipo.idtipo} value={tipo.descricao}>
                                                            {tipo.descricao}
                                                        </option>
                                                    ))}
                                            </Select>
                                        </FormControl>


                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>UF da Obra</FormLabel>
                                            <Select
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Selecione uma opção"
                                                name="ufObra"
                                                value={formData.ufObra}
                                                onChange={handleChange}
                                            >
                                                <option>SP</option>
                                                <option>RJ</option>
                                                <option>MG</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Cidade da Obra</FormLabel>
                                            <Select
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Selecione uma opção"
                                                name="cityObra"
                                                value={formData.cityObra}
                                                onChange={handleChange}
                                            >
                                                <option>São Paulo</option>
                                                <option>Rio de Janeiro</option>
                                                <option>Belo Horizonte</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Objetivo</FormLabel>
                                            <Select
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="---"
                                                name="objetivoObra"
                                                value={formData.objetivoObra}
                                                onChange={handleChange}
                                            >
                                                <option>Estudo Preliminar</option>
                                                <option>Concorrência</option>
                                                <option>Licitação</option>
                                                <option>Desenho Prévio</option>
                                                <option>Contratação</option>
                                                <option>Outros</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Pagamento</FormLabel>
                                            <Select
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="---"
                                                name="PagamentoObra"
                                                value={formData.PagamentoObra}
                                                onChange={handleChange}
                                            >
                                                <option>Antecipado</option>
                                                <option>À Vista</option>
                                                <option>Parcelado</option>
                                                <option>Medição</option>
                                                <option>Carga</option>
                                                <option>Financiamento</option>
                                                <option>Carteira</option>
                                                <option>Outros</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Descrição</FormLabel>
                                            <Input
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="Digite a descrição"
                                                name="descricacaoObra"
                                                value={formData.descricacaoObra}
                                                onChange={handleChange}
                                                _placeholder={{ color: "gray.400" }}
                                            />
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Frete</FormLabel>
                                            <Select
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="---"
                                                name="freteObra"
                                                value={formData.freteObra}
                                                onChange={handleChange}
                                            >
                                                <option>CIF</option>
                                                <option>FOB</option>
                                                <option>Sem Frete</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Montagem</FormLabel>
                                            <Select
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="---"
                                                name="montagemObra"
                                                value={formData.montagemObra}
                                                onChange={handleChange}
                                            >
                                                <option>Sim</option>
                                                <option>Não</option>
                                            </Select>
                                        </FormControl>
                                        {/* Campo 1: Data de Entrada (pré-preenchido com a data atual) */}
                                        <FormControl mb={4}>
                                            <FormLabel color={textColor}>Data de Entrada</FormLabel>
                                            <Input
                                                type="date"
                                                name="dataEntrada"
                                                value={formData.dataEntrada}
                                                readOnly // isso faz q o campo não seja editável. 
                                                bg={inputBgColor}
                                                color={textColor}
                                            />
                                        </FormControl>

                                        {/* Campo 2: Solicitação de Entrega da Proposta */}
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Solicitação de Entrega da Proposta</FormLabel>
                                            <Input
                                                type="date"
                                                name="solicitacaoEntrega"
                                                value={formData.solicitacaoEntrega}
                                                onChange={handleChange}
                                                bg={inputBgColor}
                                                color={textColor}
                                            />
                                        </FormControl>

                                        {/* Campo 3: Previsão de Contratação */}
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Previsão de Contratação</FormLabel>
                                            <Input
                                                type="date"
                                                name="previsaoContratacao"
                                                value={formData.previsaoContratacao}
                                                onChange={handleChange}
                                                bg={inputBgColor}
                                                color={textColor}
                                            />
                                        </FormControl>

                                        {/* Campo 4: Início do Fornecimento */}
                                        <FormControl isRequired mb={4}>
                                            <FormLabel color={textColor}>Início do Fornecimento</FormLabel>
                                            <Input
                                                type="date"
                                                name="inicioFornecimento"
                                                value={formData.inicioFornecimento}
                                                onChange={handleChange}
                                                bg={inputBgColor}
                                                color={textColor}
                                            />
                                        </FormControl>


                                    </GridItem>
                                </Grid>
                                <Flex justify="flex-end" mt={4}>
                                    <IconButton
                                        aria-label="Próxima aba"
                                        icon={<ArrowForwardIcon />}
                                        bg={buttonBg}
                                        color="white"
                                        _hover={{ bg: buttonHover }}
                                        onClick={goToNextTab}
                                    />
                                </Flex>
                            </form>

                            {/* Modal de seleção de clientes */}
                            <Modal
                                isOpen={isModalOpen}
                                onClose={closeModal}
                                size={{ base: "full", md: "lg" }} // Full screen no mobile, largo no desktop
                                isCentered
                            >
                                <ModalOverlay />
                                <ModalContent
                                    maxWidth={{ base: "100%", md: "800px" }} // Limita largura no desktop
                                    borderRadius="10px"
                                    boxShadow="lg"
                                >
                                    <ModalHeader>Lista de Clientes Ativos</ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>
                                        {/* Barra de Pesquisa */}
                                        <FormControl mb={4}>
                                            <Input
                                                placeholder="Pesquise por CPF/CNPJ ou Nome"
                                                value={searchQuery}
                                                onChange={(e) => handleSearch(e.target.value)}
                                                bg={inputBgColor}
                                                color={textColor}
                                                border="1px solid"
                                                borderColor="gray.300"
                                            />
                                        </FormControl>

                                        {/* Tabela Responsiva */}
                                        <Box
                                            overflowY="auto" // Scroll apenas vertical
                                            maxHeight="300px" // Define altura máxima do modal
                                        >
                                            <Table
                                                display={{ base: "none", md: "table" }} // Desktop: Tabela
                                                variant="striped"
                                                size="sm"
                                                bg="white"
                                                borderRadius="8px"
                                                boxShadow="sm"
                                                tableLayout="fixed" // Força largura fixa das colunas
                                                width="100%" // Garante que a tabela ocupe toda a largura disponível
                                            >
                                                <Thead>
                                                    <Tr>
                                                        <Th width="20%" textAlign="left">CPF/CNPJ</Th>
                                                        <Th width="35%" textAlign="left" whiteSpace="normal" wordBreak="break-word">
                                                            Nome
                                                        </Th>
                                                        <Th width="25%" textAlign="left" whiteSpace="normal" wordBreak="break-word">
                                                            Cidade
                                                        </Th>
                                                        <Th width="10%" textAlign="center">UF</Th>
                                                        <Th width="10%" textAlign="center">Ação</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {filteredClientes.map((cliente, index) => (
                                                        <Tr key={index} _hover={{ bg: "gray.100" }}>
                                                            <Td>{formatCpfCnpj(cliente.cpfcnpj)}</Td>
                                                            <Td whiteSpace="normal" wordBreak="break-word">{cliente.nome}</Td>
                                                            <Td whiteSpace="normal" wordBreak="break-word">{cliente.cidade}</Td>
                                                            <Td textAlign="center">{cliente.uf}</Td>
                                                            <Td textAlign="center">
                                                                <Button
                                                                    size="sm"
                                                                    bg="#FFBF00" // Define o fundo com a cor desejada
                                                                    color="black" // Define a cor do texto
                                                                    _hover={{ bg: "#E5AC00" }} // Cor ao passar o mouse
                                                                    _active={{ bg: "#CC9900" }} // Cor ao clicar
                                                                    onClick={() => selectCliente(cliente.cpfcnpj)}
                                                                >
                                                                    Selecionar
                                                                </Button>
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>

                                            {/* Mobile: Visualização em Cartões */}
                                            <Box display={{ base: "block", md: "none" }}>
                                                {filteredClientes.map((cliente, index) => (
                                                    <Box
                                                        key={index}
                                                        bg="white"
                                                        p={4}
                                                        mb={3}
                                                        borderRadius="md"
                                                        borderWidth="1px"
                                                        borderColor="gray.200"
                                                        boxShadow="sm"
                                                    >
                                                        <Text fontWeight="bold">{formatCpfCnpj(cliente.cpfcnpj)}</Text>
                                                        <Text>{cliente.nome}</Text>
                                                        <Text>{cliente.cidade}, {cliente.uf}</Text>
                                                        <Button
                                                            size="sm"
                                                            bg="#FFBF00" // Define o fundo com a cor desejada
                                                            color="black" // Define a cor do texto
                                                            _hover={{ bg: "#E5AC00" }} // Cor ao passar o mouse
                                                            _active={{ bg: "#CC9900" }} // Cor ao clicar
                                                            onClick={() => selectCliente(cliente.cpfcnpj)}
                                                        >
                                                            Selecionar
                                                        </Button>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button bg="#FFBF00" color="black" onClick={closeModal}>
                                            Fechar
                                        </Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>





                        </TabPanel>

                        {/* Outros Painéis */}
                        {tabConfig.showDescricao && (
                            <TabPanel>
                                <form onSubmit={handleSubmit}>
                                    {/* Layout com três colunas */}
                                    <Grid
                                        templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                                        gap={6}
                                    >
                                        {/* Coluna 1: Características */}
                                        <GridItem>
                                            <Heading as="h2" size="md" color={textColor} mb={4}>
                                                Características
                                            </Heading>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Área Obra (m²)</FormLabel>
                                                <Input
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="0,00"
                                                    name="areaObra"
                                                    value={formData.areaObra}
                                                    onChange={handleChange}
                                                />
                                            </FormControl>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Cobertura (m²)</FormLabel>
                                                <Input
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="0,00"
                                                    name="cobertura"
                                                    value={formData.cobertura}
                                                    onChange={handleChange}
                                                />
                                            </FormControl>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Unidades Habitacionais</FormLabel>
                                                <Input
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="0"
                                                    name="unidadesHabitacionais"
                                                    value={formData.unidadesHabitacionais}
                                                    onChange={handleChange}
                                                />
                                            </FormControl>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Classe Agressividade</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="---"
                                                    name="classeAgressividade"
                                                    value={formData.classeAgressividade}
                                                    onChange={handleChange}
                                                >
                                                    <option>I</option>
                                                    <option>II</option>
                                                    <option>III</option>
                                                    <option>IV</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Lateral Extremante</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="lateralExtrometalica"
                                                    value={formData.lateralExtrometalica}
                                                    onChange={handleChange}
                                                >
                                                    <option>Sim</option>
                                                    <option>Não</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Terreno Nivelado</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="---"
                                                    name="terrenoNivelado"
                                                    value={formData.terrenoNivelado}
                                                    onChange={handleChange}
                                                >
                                                    <option>Sim</option>
                                                    <option>Não</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Acesso Terreno</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="---"
                                                    name="acessoTerreno"
                                                    value={formData.acessoTerreno}
                                                    onChange={handleChange}
                                                >
                                                    <option>Completo</option>
                                                    <option>Limitado</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Solução Estrutural</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="---"
                                                    name="solucaoEstrutural"
                                                    value={formData.solucaoEstrutural}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Cliente</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Tipo Estrutura</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="---"
                                                    name="tipoEstrutura"
                                                    value={formData.tipoEstrutura}
                                                    onChange={handleChange}
                                                >
                                                    <option>Pré-Moldada</option>
                                                    <option>In-loco</option>
                                                    <option>Mista</option>
                                                    <option>Metálica</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Tipo Cobertura</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="---"
                                                    name="tipoCobertura"
                                                    value={formData.tipoCobertura}
                                                    onChange={handleChange}
                                                >
                                                    <option>Pré-Moldada</option>
                                                    <option>Laje</option>
                                                    <option>Mista</option>
                                                    <option>Metálica</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Tipo Fechamento</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="---"
                                                    name="tipoFechamento"
                                                    value={formData.tipoFechamento}
                                                    onChange={handleChange}
                                                >
                                                    <option>Pré-Moldado</option>
                                                    <option>Misto</option>
                                                    <option>Metálico</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Tipo Acessos</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="---"
                                                    name="tipoAcessos"
                                                    value={formData.tipoAcessos}
                                                    onChange={handleChange}
                                                >
                                                    <option>Pré-Moldado</option>
                                                    <option>Laje</option>
                                                    <option>Misto</option>
                                                    <option>Metálico</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Tipo Subsolos</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="---"
                                                    name="tipoSubsolos"
                                                    value={formData.tipoSubsolos}
                                                    onChange={handleChange}
                                                >
                                                    <option>Pré-Moldado</option>
                                                    <option>Laje</option>
                                                    <option>Misto</option>
                                                    <option>Metálico</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Tipo Fundação</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="---"
                                                    name="tipoFundacao"
                                                    value={formData.tipoFundacao}
                                                    onChange={handleChange}
                                                >
                                                    <option>Blocos</option>
                                                    <option>Sapatas</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Tipo Estaca</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="---"
                                                    name="tipoSubsolos"
                                                    value={formData.tipoSubsolos}
                                                    onChange={handleChange}
                                                >
                                                    <option>Pré-Moldada</option>
                                                    <option>Hélice</option>
                                                    <option>Escavada</option>
                                                    <option>Raiz</option>
                                                    <option>Outra</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl isRequired mb={4}>
                                                <FormLabel color={textColor}>Tipo Cortinas</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="---"
                                                    name="tipoSubsolos"
                                                    value={formData.tipoSubsolos}
                                                    onChange={handleChange}
                                                >
                                                    <option>Pré-Moldada</option>
                                                    <option>In-loco</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>

                                        </GridItem>

                                        {/* Coluna 2: Escopo */}
                                        <GridItem>
                                            <Heading as="h2" size="md" color={textColor} mb={4}>
                                                Escopo
                                            </Heading>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Estrutura</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="estrutura"
                                                    value={formData.estrutura}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Pluvial Embutido</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="pluvialEmbutido"
                                                    value={formData.pluvialEmbutido}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>SPDA Embutido</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="spdaEmbutido"
                                                    value={formData.spdaEmbutido}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Vedação Pilar/Viga</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="vedacaoPilarViga"
                                                    value={formData.vedacaoPilarViga}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Cobertura</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="cobertura"
                                                    value={formData.cobertura}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Fechamento</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="fechamento"
                                                    value={formData.fechamento}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Vedação Interna/Externa</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="vedacaoInternaExterna"
                                                    value={formData.vedacaoInternaExterna}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Acessos</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="acessos"
                                                    value={formData.acessos}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Subsolos</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="subsolos"
                                                    value={formData.subsolos}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Fundação</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="fundacao"
                                                    value={formData.fundacao}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Estacas</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="estacas"
                                                    value={formData.estacas}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Estaqueamento</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="estaqueamento"
                                                    value={formData.estaqueamento}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Cortinas</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="cortinas"
                                                    value={formData.cortinas}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Capeamento</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="capeamento"
                                                    value={formData.capeamento}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Alpendres</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="alprendes"
                                                    value={formData.alprendes}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Telhamento</FormLabel>
                                                <Select
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Selecione"
                                                    name="telhamento"
                                                    value={formData.telhamento}
                                                    onChange={handleChange}
                                                >
                                                    <option>BPM</option>
                                                    <option>Opcional</option>
                                                    <option>Nenhum</option>
                                                </Select>
                                            </FormControl>

                                        </GridItem>

                                        {/* Coluna 3: Fechamento e Cobertura */}
                                        <GridItem>
                                            <Heading as="h2" size="md" color={textColor} mb={4}>
                                                Fechamento e Cobertura
                                            </Heading>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Descrição do Fechamento</FormLabel>
                                                <Input
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Descrição do Fechamento"
                                                    name="descricaoFechamento"
                                                    value={formData.descricaoFechamento}
                                                    onChange={handleChange}
                                                />
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Telhas de Cobertura</FormLabel>
                                                <Input
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="Telhas de Cobertura"
                                                    name="telhasCobertura"
                                                    value={formData.telhasCobertura}
                                                    onChange={handleChange}
                                                />
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Inclinação da Cobertura (%)</FormLabel>
                                                <Input
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="0,00"
                                                    name="inclinacaoCobertura"
                                                    value={formData.inclinacaoCobertura}
                                                    onChange={handleChange}
                                                />
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Peso Telhas (Kg/m²)</FormLabel>
                                                <Input
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="0,00"
                                                    name="pesoTelhas"
                                                    value={formData.pesoTelhas}
                                                    onChange={handleChange}
                                                />
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Entre-Terças (m)</FormLabel>
                                                <Input
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="0,00"
                                                    name="entreTercas"
                                                    value={formData.entreTercas}
                                                    onChange={handleChange}
                                                />
                                            </FormControl>
                                            <FormControl mb={4}>
                                                <FormLabel color={textColor}>Sobrecarga Adicional (Kg/m²)</FormLabel>
                                                <Input
                                                    bg={inputBgColor}
                                                    color={textColor}
                                                    placeholder="0,00"
                                                    name="pesoTelhas"
                                                    value={formData.pesoTelhas}
                                                    onChange={handleChange}
                                                />
                                            </FormControl>
                                        </GridItem>
                                    </Grid>
                                    {/* Botão de próxima aba */}
                                    <Flex justify="space-between" mt={4}>
                                        <IconButton
                                            aria-label="Aba anterior"
                                            icon={<ArrowBackIcon />}
                                            bg={buttonBg}
                                            color="white"
                                            _hover={{ bg: buttonHover }}
                                            onClick={goToPreviousTab}
                                        />
                                        <IconButton
                                            aria-label="Próxima aba"
                                            icon={<ArrowForwardIcon />}
                                            bg={buttonBg}
                                            color="white"
                                            _hover={{ bg: buttonHover }}
                                            onClick={goToNextTab}
                                        />
                                    </Flex>
                                </form>
                            </TabPanel>
                        )}
                        {tabConfig.showObservacoes && (
                            <TabPanel>
                                <form onSubmit={handleSubmit}>
                                    {/* Layout em Linha para os Selects */}
                                    <Grid
                                        templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
                                        gap={6}
                                    >
                                        <FormControl isRequired>
                                            <FormLabel color={textColor}>Arquitetônico</FormLabel>
                                            <Select
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="---"
                                                name="arquitetonico"
                                                value={formData.arquitetonico}
                                                onChange={handleChange}
                                            >
                                                <option>Sim</option>
                                                <option>Não</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel color={textColor}>Estrutural</FormLabel>
                                            <Select
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="---"
                                                name="estrutural"
                                                value={formData.estrutural}
                                                onChange={handleChange}
                                            >
                                                <option>Sim</option>
                                                <option>Não</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel color={textColor}>Sondagem</FormLabel>
                                            <Select
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="---"
                                                name="sondagem"
                                                value={formData.sondagem}
                                                onChange={handleChange}
                                            >
                                                <option>Sim</option>
                                                <option>Não</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel color={textColor}>Quantitativos</FormLabel>
                                            <Select
                                                bg={inputBgColor}
                                                color={textColor}
                                                placeholder="---"
                                                name="quantitativos"
                                                value={formData.quantitativos}
                                                onChange={handleChange}
                                            >
                                                <option>Sim</option>
                                                <option>Não</option>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Área de Texto para Observação */}
                                    <FormControl isRequired>
                                        <FormLabel color={textColor}>Observação</FormLabel>
                                        <Input
                                            as="textarea"
                                            rows={5}
                                            bg={inputBgColor}
                                            color={textColor}
                                            placeholder="Adicione sua observação"
                                            name="observacao"
                                            value={formData.observacao}
                                            onChange={handleChange}
                                        />
                                    </FormControl>

                                    <Flex justify="space-between" mt={4}>
                                        <IconButton
                                            aria-label="Aba anterior"
                                            icon={<ArrowBackIcon />}
                                            bg={buttonBg}
                                            color="white"
                                            _hover={{ bg: buttonHover }}
                                            onClick={goToPreviousTab}
                                        />
                                    </Flex>
                                </form>
                            </TabPanel>
                        )}

                    </TabPanels>
                </Tabs>
            </Box>
        </Box>
    );
};

export default FichasEntrada;
