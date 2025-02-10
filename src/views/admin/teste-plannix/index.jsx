import React, { useState } from "react";
import axios from "axios";
import { Box, Button, Input, Table, Thead, Tbody, Tr, Th, Td, Flex, Spinner } from "@chakra-ui/react";
import { FaSearch, FaCalendarAlt, FaBuilding } from "react-icons/fa";

const Obras = () => {
    const [obras, setObras] = useState([]);
    const [dataInicial, setDataInicial] = useState("");
    const [dataFinal, setDataFinal] = useState("");
    const [sigla, setSigla] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchObras = async () => {
        if (!dataInicial || !dataFinal || !sigla) {
            alert("Preencha todos os campos antes de pesquisar.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get("http://192.168.0.249:5000/api/sg/obras", {
                params: {
                    dataInicial: dataInicial.split("-").reverse().join("/"), // Converte de YYYY-MM-DD para DD/MM/YYYY
                    dataFinal: dataFinal.split("-").reverse().join("/"),
                    sigla
                }
            });
            setObras(response.data);
        } catch (error) {
            console.error("Erro ao buscar obras:", error);
        }
        setIsLoading(false);
    };

    return (
        <Box p={5} mt={100} bg="white" borderRadius="lg" boxShadow="lg">
            {/* Filtros em linha */}
            <Flex gap={3} align="center" wrap="wrap">
                {/* Campo Sigla */}
                <Flex align="center" gap={2}>
                    <FaBuilding color="#FFBF00" size={18} />
                    <Input
                        placeholder="Sigla"
                        value={sigla}
                        onChange={(e) => setSigla(e.target.value)}
                        width="120px"
                    />
                </Flex>

                {/* Campo Data Inicial */}
                <Flex align="center" gap={2}>
                    <FaCalendarAlt color="#FFBF00" size={18} />
                    <Input
                        type="date"
                        value={dataInicial}
                        onChange={(e) => setDataInicial(e.target.value)}
                        width="160px"
                    />
                </Flex>

                {/* Campo Data Final */}
                <Flex align="center" gap={2}>
                    <FaCalendarAlt color="#FFBF00" size={18} />
                    <Input
                        type="date"
                        value={dataFinal}
                        onChange={(e) => setDataFinal(e.target.value)}
                        width="160px"
                    />
                </Flex>

                {/* Botão de Pesquisa */}
                <Button leftIcon={<FaSearch />} colorScheme="yellow" bg="#FFBF00" onClick={fetchObras}>
                    Pesquisar
                </Button>
            </Flex>

            {/* Tabela de Obras */}
            {isLoading ? (
                <Box mt={5} textAlign="center">
                    <Spinner size="xl" color="yellow.500" />
                </Box>
            ) : (
                obras.length > 0 && (
                    <Box mt={5}>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>ID</Th>
                                    <Th>Sigla</Th>
                                    <Th>Nome da Obra</Th>
                                    <Th>Data Inicial</Th>
                                    <Th>Data Final</Th>
                                    <Th>Status</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {obras.map((obra) => (
                                    <Tr key={obra.codObra}>
                                        <Td>{obra.codObra}</Td>
                                        <Td>{obra.siglaObra}</Td>
                                        <Td>{obra.nomeObra}</Td>
                                        <Td>{obra.dataInicial.split("T")[0].split("-").reverse().join("/")}</Td>
                                        <Td>{obra.dataFinal.split("T")[0].split("-").reverse().join("/")}</Td>
                                        <Td>{obra.status}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                )
            )}
        </Box>
    );
};

export default Obras;
