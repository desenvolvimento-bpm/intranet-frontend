import React, { useState } from "react";
import {
    Box,
    Select,
    Input,
    Button,
    HStack,
    Text,
    VStack,
} from "@chakra-ui/react";

const FilterOptions = ({ columnId, applyFilter, removeFilter, sortColumn }) => {
    const [operator, setOperator] = useState("contains"); // Operador inicial
    const [value, setValue] = useState(""); // Valor inicial do filtro
    const [sortDirection, setSortDirection] = useState(""); // Ordenação inicial

    const handleApplyFilter = () => {
        applyFilter(columnId, operator, value); // Aplica o filtro
    };

    const handleSort = (direction) => {
        setSortDirection(direction); // Define a direção da ordenação
        sortColumn(columnId, direction); // Aplica a ordenação
    };

    return (
        <VStack align="stretch" spacing={3}>
            <Box>
                <Text fontSize="sm" mb={1}>
                    Ordenar:
                </Text>
                <HStack spacing={2}>
                    <Button
                        size="xs"
                        onClick={() => handleSort("asc")}
                        colorScheme={sortDirection === "asc" ? "blue" : "gray"}
                    >
                        ASC
                    </Button>
                    <Button
                        size="xs"
                        onClick={() => handleSort("desc")}
                        colorScheme={sortDirection === "desc" ? "blue" : "gray"}
                    >
                        DESC
                    </Button>
                </HStack>
            </Box>

            <Box>
                <Text fontSize="sm" mb={1}>
                    Filtro:
                </Text>
                {/* Operador */}
                <Select
                    size="sm"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    mb={2}
                >
                    <option value="contains">Contém</option>
                    <option value="does not contain">Não contém</option>
                    <option value="equals">Igual</option>
                    <option value="does not equal">Não igual</option>
                    <option value="starts with">Começa com</option>
                    <option value="ends with">Termina com</option>
                    <option value="is empty">Está vazio</option>
                    <option value="is not empty">Não está vazio</option>
                </Select>

                {/* Valor */}
                <Input
                    size="sm"
                    placeholder="Digite o valor"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    mb={2}
                />

                {/* Aplicar Filtro */}
                <Button size="sm" colorScheme="blue" w="full" onClick={handleApplyFilter}>
                    Aplicar Filtro
                </Button>
            </Box>

            {/* Remover Filtro */}
            <Box>
                <Button
                    size="sm"
                    colorScheme="red"
                    w="full"
                    onClick={() => removeFilter(columnId)}
                >
                    Remover Filtro
                </Button>

            </Box>
        </VStack>
    );
};

export default FilterOptions;
