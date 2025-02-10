import React, { useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from "@tanstack/react-table";
import {
    Box,
    Input,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Select,
    Button,
    HStack,
    VStack,
    Flex,
    Icon,
} from "@chakra-ui/react";
import { FaSort, FaSortUp, FaSortDown, FaSearch } from "react-icons/fa";

const CustomTable = ({ data, columns }) => {
    const [globalFilter, setGlobalFilter] = useState(""); // Filtro global

    // Configuração da tabela
    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter, // Conecta o filtro global
        },
        globalFilterFn: "includesString", // Tipo de filtro global
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(), // Aplica filtragem global
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const tableStyle = {
        borderCollapse: "collapse",
        width: "100%",
    };

    const headerStyle = {
        fontWeight: "bold",
        backgroundColor: "white",
        position: "sticky",
        top: 0,
        zIndex: 2,
        borderBottom: "1px solid gray",
        cursor: "pointer",
        userSelect: "none",
    };

    return (
        <VStack spacing={4} align="stretch">
            {/* Barra de pesquisa estilizada */}
            <Flex
                alignItems="center"
                border="1px solid"
                borderColor="gray.300"
                borderRadius="full"
                px={4}
                py={2}
                mb={4}
                bg="white"
                shadow="sm"
            >
                <Icon as={FaSearch} color="gray.500" mr={2} />
                <Input
                    placeholder="Pesquisar em todas as colunas..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)} // Atualiza o filtro global
                    border="none"
                    focusBorderColor="transparent"
                />
            </Flex>

            {/* Tabela com ordenação */}
            <Box
                overflowY="auto"
                maxHeight="600px"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
            >
                <Table size="sm" style={tableStyle}>
                    <Thead>
                        <Tr>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <React.Fragment key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <Th
                                            key={header.id}
                                            style={headerStyle}
                                            onClick={
                                                header.column.getCanSort()
                                                    ? header.column.getToggleSortingHandler()
                                                    : undefined
                                            }
                                            textAlign="left"
                                        >
                                            <Flex alignItems="center" justify="space-between">
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {header.column.getCanSort() && (
                                                    <Icon
                                                        as={
                                                            header.column.getIsSorted() === "asc"
                                                                ? FaSortUp
                                                                : header.column.getIsSorted() ===
                                                                    "desc"
                                                                    ? FaSortDown
                                                                    : FaSort
                                                        }
                                                        ml={2}
                                                        color="gray.500"
                                                    />
                                                )}
                                            </Flex>
                                        </Th>
                                    ))}
                                </React.Fragment>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {table.getRowModel().rows.map((row) => (
                            <Tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <Td
                                        key={cell.id}
                                        borderBottom="1px solid gray"
                                        py={2}
                                        _hover={{ bg: "gray.50" }}
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </Td>
                                ))}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>

            {/* Controle de paginação */}
            <HStack justify="space-between" w="100%">
                <HStack spacing={2}>
                    <Button
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Próximo
                    </Button>
                </HStack>

                {/* Seleção de número de linhas por página */}
                <HStack spacing={2}>
                    <span>
                        Página{" "}
                        <strong>
                            {table.getState().pagination.pageIndex + 1} de{" "}
                            {table.getPageCount()}
                        </strong>
                    </span>
                    <Select
                        size="sm"
                        value={table.getState().pagination.pageSize}
                        onChange={(e) =>
                            table.setPageSize(Number(e.target.value))
                        }
                    >
                        {[5, 10, 20].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize} por página
                            </option>
                        ))}
                    </Select>
                </HStack>
            </HStack>
        </VStack>
    );
};

export default CustomTable;
