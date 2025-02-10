import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Flex, Input, InputGroup, InputLeftElement, Text, IconButton, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, useToast,
    VStack, HStack, useColorModeValue, Menu, MenuButton, MenuList, MenuItem, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, Checkbox, Select,
} from "@chakra-ui/react";

import {
    FiPlusCircle, FiDownload, FiChevronDown, FiChevronUp, FiFilter, FiEyeOff, FiSettings, FiSearch, FiMail, FiMoreVertical
} from "react-icons/fi";

import axios from "axios";
import * as XLSX from "xlsx";

const FichaRepresentante = () => {
    const [fichas, setFichas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [fichasPerPage, setFichasPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState("");
    const [tipoObraFilter, setTipoObraFilter] = useState("");
    const [tiposObra, setTiposObra] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortColumn, setSortColumn] = useState("idficha");
    const [sortOrder, setSortOrder] = useState("desc");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState([
        "idficha",
        "tipoobra",
        "orcamento",
        "cliente",
        "nomeobra",
        "entrada",
        "status",
    ]);
    const toast = useToast();
    const navigate = useNavigate();

    const statusColors = {
        "Não Enviado": "#A9A9A9",
        "Em Cadastro": "#87CEEB",
        "Em Aprovação": "#FFD700",
        "Em Processo": "#4682B4",
        "Em Andamento": "#32CD32",
        "Orçado": "#FFA07A",
        "Efetivado": "#008000",
        "Vendido": "#006400",
        "Cancelado": "#FF0000",
        "Suspenso": "#FF8C00",
        "Perdido": "#8B0000",
        "Perdido por Inatividade": "#696969",
        "Obsoleto": "#708090",
        "Encerrado": "#00008B",
        "Aguardando Informação": "#FFBF00",
    };


    const tableBg = useColorModeValue("white", "gray.800");
    const headerBg = useColorModeValue("#FFBF00", "gray.700");
    const textColor = useColorModeValue("#000000", "white");
    const rowSeparatorColor = useColorModeValue("gray.800", "gray.600");


    const handleSort = (column, order) => {
        setSortColumn(column);
        setSortOrder(order);
        setFichas((prevFichas) =>
            [...prevFichas].sort((a, b) => {
                if (order === "asc") return a[column] > b[column] ? 1 : -1;
                return a[column] < b[column] ? 1 : -1;
            })
        );
    };



    const handleHideColumn = (column) => {
        setVisibleColumns((prev) => prev.filter((col) => col !== column));
    };
    // Função para exportar dados em formato Excel
    const exportToExcel = (data, filename = "fichas.xlsx") => {
        // Cria uma planilha no formato XLSX
        const worksheet = XLSX.utils.json_to_sheet(data);
        // Configura as colunas para melhorar a visualização
        const columnWidths = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
        worksheet["!cols"] = columnWidths;
        // Cria o livro (workbook)
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Fichas");
        // Gera o arquivo Excel
        XLSX.writeFile(workbook, filename);
    };

    const toggleModal = () => setIsModalOpen((prev) => !prev);

    const handleToggleColumn = (column) => {
        setVisibleColumns((prev) =>
            prev.includes(column)
                ? prev.filter((col) => col !== column) // Remove coluna
                : [...prev, column] // Adiciona coluna
        );
    };

    // Define filteredFichas como um estado
    const [filteredFichas, setFilteredFichas] = useState([]);

    useEffect(() => {
        const filtered = fichas.filter((ficha) => {
            const matchesSearchTerm = searchTerm
                ? Object.keys(ficha).some((key) =>
                    ficha[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
                : true;
            const matchesStatus = statusFilter ? ficha.status === statusFilter : true;
            const matchesTipoObra = tipoObraFilter ? ficha.tipoobra === tipoObraFilter : true;
            return matchesSearchTerm && matchesStatus && matchesTipoObra;
        });

        setFilteredFichas(filtered);
    }, [fichas, searchTerm, statusFilter, tipoObraFilter]);


    const handleFilter = (value, column) => {
        const filtered = fichas.filter((ficha) =>
            ficha[column]?.toString().toLowerCase().includes(value.toLowerCase())
        );
        setFilteredFichas(filtered);
    };

    // Use filteredFichas para a exibição de dados paginados
    const indexOfLastFicha = currentPage * fichasPerPage;
    const indexOfFirstFicha = indexOfLastFicha - fichasPerPage;
    const currentFichas = filteredFichas.slice(indexOfFirstFicha, indexOfLastFicha);

    // Calculando o número total de páginas com base em filteredFichas
    const totalPages = Math.ceil(filteredFichas.length / fichasPerPage);




    const fetchFichas = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(
                "http://192.168.0.249:5000/api/crm/fichasentrada",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = response.data.map((ficha) => ({
                ...ficha,
                orcamento: ficha.orcamento === "null" || ficha.revisao === "null" ? " / " : ficha.orcamento,
            }));
            setFichas(data.sort((a, b) => b.idficha - a.idficha));
            setLoading(false);
        } catch (error) {
            toast({
                title: "Erro ao buscar fichas.",
                description: "Não foi possível carregar os dados.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setLoading(false);
        }
    };
    const fetchTiposObra = async () => {
        try {
            const response = await axios.get(
                "http://192.168.0.249:5000/api/crm/tipoobras"
            );
            setTiposObra(response.data);
        } catch (error) {
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
        fetchFichas();
        fetchTiposObra();
    }, []);


    return (
        <Box
            p={6}
            mt={{ base: 28, lg: 20 }}
            maxWidth="100%"
            width={{ base: "90%", md: "90%", lg: "100%" }}
            mx="auto"
            borderRadius="lg"
            shadow="md"
            overflowY="auto"
        >
            <VStack spacing={6} mb={6} align="stretch">
                {window.innerWidth < 768 ? (
                    // Mobile: Adiciona os filtros específicos para o mobile
                    <VStack spacing={4} align="stretch">
                        <Select
                            placeholder="Filtrar por Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            size="sm"
                            bg={tableBg}
                        >
                            {Object.keys(statusColors).map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </Select>
                        <Select
                            placeholder="Filtrar por Tipo de Obra"
                            value={tipoObraFilter}
                            onChange={(e) => setTipoObraFilter(e.target.value)}
                            size="sm"
                            bg={tableBg}
                        >
                            {tiposObra.map((tipo) => (
                                <option key={tipo.idtipo} value={tipo.descricao}>
                                    {tipo.descricao}
                                </option>
                            ))}
                        </Select>
                        <InputGroup>
                            <InputLeftElement pointerEvents="none" children={<FiSearch />} />
                            <Input
                                placeholder="Buscar por cliente ou obra"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                bg={tableBg}
                            />
                        </InputGroup>
                        <Button
                            size="sm"
                            bg="#FFBF00"
                            color="black"
                            _hover={{ bg: "#FFD700" }}
                            leftIcon={<FiDownload />}
                            onClick={() => exportToExcel(filteredFichas)}
                        >
                            Exportar Excel
                        </Button>
                        <Button
                            size="sm"
                            bg="#FFBF00"
                            color="black"
                            _hover={{ bg: "#FFD700" }}
                            leftIcon={<FiPlusCircle />}
                            onClick={() => navigate("/admin/fichas-entrada")}
                        >
                            Criar Ficha de Entrada
                        </Button>
                    </VStack>
                ) : (
                    // Desktop: Mantém a barra de pesquisa e botões como estão
                    <HStack spacing={4} width="100%" justify="space-between">
                        <InputGroup width="40%">
                            <InputLeftElement pointerEvents="none" children={<FiSearch />} />
                            <Input
                                placeholder="Buscar por cliente ou obra"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                bg={tableBg}
                            />
                        </InputGroup>
                        <HStack spacing={2}>
                            <Button
                                size="md"
                                bg="#FFBF00"
                                color="black"
                                _hover={{ bg: "#FFD700" }}
                                leftIcon={<FiDownload />}
                                onClick={() => exportToExcel(filteredFichas)}
                            >
                                Exportar Excel
                            </Button>
                            <Button
                                size="md"
                                bg="#FFBF00"
                                color="black"
                                _hover={{ bg: "#FFD700" }}
                                leftIcon={<FiPlusCircle />}
                                onClick={() => navigate("/admin/fichas-entrada")}
                            >
                                Criar Ficha de Entrada
                            </Button>
                        </HStack>
                    </HStack>
                )}
            </VStack>

            {/* Mobile View */}
            {window.innerWidth < 768 ? (
                <VStack spacing={4}>
                    {currentFichas.map((ficha) => (
                        <Box
                            key={`${ficha.idficha}/${ficha.revisaoficha}`}
                            borderWidth="1px"
                            borderRadius="lg"
                            p={4}
                            shadow="md"
                            bg={tableBg}
                            width="100%"
                            minWidth="300px"
                            overflow="hidden"
                        >
                            <Text fontWeight="bold" fontSize="lg">
                                {ficha.cliente || "Cliente não informado"}
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                                Tipo da Obra: {ficha.tipoobra || " / "}
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                                ID: {`${ficha.idficha}/${ficha.revisaoficha}`}
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                                Código: {`${ficha.orcamento}/${ficha.revisao}`}
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                                Data: {new Date(ficha.entrada).toLocaleDateString()}
                            </Text>
                            <Badge
                                bg={statusColors[ficha.status]}
                                color="white"
                                px={3}
                                py={1}
                                borderRadius="md"
                            >
                                {ficha.status}
                            </Badge>
                            <Flex mt={2} gap={2}>
                                <IconButton
                                    icon={<FiMail />}
                                    aria-label="Mensagem"
                                    size="sm"
                                />
                                <IconButton
                                    icon={<FiMoreVertical />}
                                    aria-label="Ações"
                                    size="sm"
                                />
                            </Flex>
                        </Box>
                    ))}
                </VStack>
            ) : (
                /* Desktop View */
                <Box borderRadius="lg" overflow="hidden" shadow="lg">
                    <Table variant="simple" size="sm" bg={tableBg}>
                        <Thead bg={headerBg} position="sticky" top={0} zIndex={1}>
                            <Tr>
                                {[
                                    { label: "ID Ficha", key: "idficha" },
                                    { label: "Tipo da Obra", key: "tipoobra" },
                                    { label: "Código", key: "orcamento" },
                                    { label: "Cliente", key: "cliente" },
                                    { label: "Obra", key: "nomeobra" },
                                    { label: "Data do Cadastro", key: "entrada" },
                                    { label: "Status", key: "status" },
                                ]
                                    .filter((column) => visibleColumns.includes(column.key))
                                    .map(({ label, key }) => (
                                        <Th key={key}>
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Text fontWeight="bold" color={textColor}>
                                                    {label}
                                                </Text>
                                                <Menu>
                                                    <MenuButton
                                                        as={IconButton}
                                                        icon={<FiChevronDown />}
                                                        variant="ghost"
                                                        size="sm"
                                                    />
                                                    <MenuList>
                                                        <MenuItem icon={<FiChevronUp />} onClick={() => handleSort(key, "asc")}>
                                                            Ordenar ASC
                                                        </MenuItem>
                                                        <MenuItem icon={<FiChevronDown />} onClick={() => handleSort(key, "desc")}>
                                                            Ordenar DESC
                                                        </MenuItem>
                                                        {/* Campo de Filtrar com interação isolada */}
                                                        <Box px={3} py={2}>
                                                            <Text fontSize="sm" fontWeight="bold" mb={1}>
                                                                Filtrar
                                                            </Text>
                                                            <Input
                                                                placeholder="Digite para filtrar"
                                                                size="sm"
                                                                onClick={(e) => e.stopPropagation()} // Impede o fechamento do menu
                                                                onChange={(e) => handleFilter(e.target.value, key)}
                                                            />
                                                        </Box>
                                                        <MenuItem icon={<FiEyeOff />} onClick={() => handleHideColumn(key)}>
                                                            Ocultar Coluna
                                                        </MenuItem>
                                                        <MenuItem icon={<FiSettings />} onClick={toggleModal}>
                                                            Gerenciar Colunas
                                                        </MenuItem>
                                                    </MenuList>
                                                </Menu>



                                            </Box>
                                        </Th>
                                    ))}
                                {/* Adiciona a label da coluna "Ações" */}
                                <Th>
                                    <Text fontWeight="bold" color={textColor}>
                                        Ações
                                    </Text>
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {currentFichas.map((ficha) => (
                                <Tr key={`${ficha.idficha}/${ficha.revisaoficha}`}>
                                    {visibleColumns.includes("idficha") && (
                                        <Td>{`${ficha.idficha}/${ficha.revisaoficha}`}</Td>
                                    )}
                                    {visibleColumns.includes("tipoobra") && <Td>{ficha.tipoobra}</Td>}
                                    {visibleColumns.includes("orcamento") && <Td>{`${ficha.orcamento}/${ficha.revisao}`}</Td>}
                                    {visibleColumns.includes("cliente") && <Td>{ficha.cliente}</Td>}
                                    {visibleColumns.includes("nomeobra") && <Td>{ficha.nomeobra}</Td>}
                                    {visibleColumns.includes("entrada") && (
                                        <Td>{new Date(ficha.entrada).toLocaleDateString()}</Td>
                                    )}
                                    {visibleColumns.includes("status") && (
                                        <Td>
                                            <Badge
                                                bg={statusColors[ficha.status]}
                                                color="white"
                                                px={3}
                                                py={1}
                                                borderRadius="md"
                                            >
                                                {ficha.status}
                                            </Badge>
                                        </Td>
                                    )}
                                    {/* Adiciona a coluna de ações com os ícones */}
                                    <Td>
                                        <Flex gap={2}>
                                            <IconButton
                                                icon={<FiMail />}
                                                aria-label="Enviar mensagem"
                                                size="sm"
                                            />
                                            <IconButton
                                                icon={<FiMoreVertical />}
                                                aria-label="Mais ações"
                                                size="sm"
                                            />
                                        </Flex>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>

            )}

            {/* Modal para Gerenciar Colunas */}
            <Modal isOpen={isModalOpen} onClose={toggleModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Gerenciar Colunas</ModalHeader>
                    <ModalBody>
                        {[
                            { label: "ID Ficha", key: "idficha" },
                            { label: "Tipo da Obra", key: "tipoobra" },
                            { label: "Código", key: "orcamento" },
                            { label: "Cliente", key: "cliente" },
                            { label: "Obra", key: "nomeobra" },
                            { label: "Data do Cadastro", key: "entrada" },
                            { label: "Status", key: "status" },
                        ].map((column) => (
                            <Checkbox
                                key={column.key}
                                isChecked={visibleColumns.includes(column.key)}
                                onChange={() => handleToggleColumn(column.key)}
                            >
                                {column.label}
                            </Checkbox>
                        ))}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={toggleModal}>Fechar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Paginação */}
            <Flex justify="space-between" align="center" mt={6}>
                <Button
                    size="sm"
                    variant="outline"
                    bg="#FFBF00"
                    color="black"
                    _hover={{ bg: "#FFD700" }}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    isDisabled={currentPage === 1}
                >
                    Anterior
                </Button>
                <HStack>
                    <Text fontWeight="bold" color={textColor}>
                        Página {currentPage} de {totalPages}
                    </Text>
                    <Select
                        value={fichasPerPage}
                        onChange={(e) => setFichasPerPage(Number(e.target.value))}
                        size="sm"
                        bg={tableBg}
                    >
                        {[10, 15, 25, 50].map((option) => (
                            <option key={option} value={option}>
                                {option} por página
                            </option>
                        ))}
                    </Select>
                </HStack>
                <Button
                    size="sm"
                    variant="outline"
                    bg="#FFBF00"
                    color="black"
                    _hover={{ bg: "#FFD700" }}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    isDisabled={currentPage === totalPages}
                >
                    Próxima
                </Button>
            </Flex>
        </Box>
    );

};

export default FichaRepresentante;
