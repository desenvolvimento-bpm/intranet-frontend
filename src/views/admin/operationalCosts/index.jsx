import React, { useState, useMemo } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Select,
    MenuItem,
    IconButton,
    CircularProgress,
    Tabs,
    Tab,
    Paper,
} from '@mui/material';
import {
    ThemeProvider,
    createTheme,
} from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


// Criação de um tema Material UI
const muiTheme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f4f6f8',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

const DataGridMemo = React.memo(({ rows, columns, loading }) => (
    <Box
        sx={{
            height: 600, // Tamanho fixo da tabela
            width: '100%',
            overflow: 'auto', // Adiciona rolagem automática
        }}
    >
        <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            getRowId={(row) => row.id_unico}
            loading={loading}
            //disableColumnMenu // Desativa menu no cabeçalho
            disableColumnResize={false} // Permite redimensionamento
            disableColumnReorder={false} // Permite reordenação
            pagination // Habilita paginação
            paginationMode="client" // Paginação no cliente
            components={{
                Toolbar: GridToolbar, // Adiciona barra de ferramentas
            }}
            localeText={{
                toolbarDensity: 'Densidade',
            }}
            sx={{
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                '& .MuiDataGrid-columnHeaders': {
                    position: 'sticky', // Fixa o cabeçalho
                    top: 0,
                    zIndex: 1,
                    backgroundColor: '#f9fafb',
                    fontWeight: 'bold',
                },
                '& .MuiDataGrid-row:nth-of-type(odd)': {
                    backgroundColor: '#f7f7f7', // Linhas ímpares destacadas
                },
                '& .MuiDataGrid-cell:hover': {
                    backgroundColor: '#f0f8ff', // Destaque ao passar o mouse
                },
                '& .MuiDataGrid-footerContainer': {
                    backgroundColor: '#f9fafb',
                },
            }}
        />
    </Box>
));


function OperationalCosts() {
    const [activeTab, setActiveTab] = useState(0); // Controle de Tabs
    const [filters, setFilters] = useState({ year: '2024', month: '12' }); // Filtros
    const [loading, setLoading] = useState(false); // Controle de carregamento
    const [data, setData] = useState({ custoFixo: [], cargasExpedidas: [], movtoEstoque: [], requisicoes: [], notas: [], projetadas: [], producaoSG: [], expedicaoSG: [], producaoPlannix: [], montagemPlannix: [], rhDados: [], nfEntrada: [] }); // Dados das tabelas
    const [searchText, setSearchText] = useState(''); // Campo de busca
    const [filteredRows, setFilteredRows] = useState([]); // Filtragem dinâmica

    const handleChangeTab = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchText(value);
        const currentRows = data.custoFixo;
        setFilteredRows(
            currentRows.filter((row) =>
                Object.values(row).some((val) =>
                    String(val).toLowerCase().includes(value)
                )
            )
        );
    };

    const generateDateRange = (year, month) => {
        const dataInicial = `01/${month.toString().padStart(2, '0')}/${year}`;
        const lastDay = new Date(year, month, 0).getDate(); // Último dia do mês
        const dataFinal = `${lastDay}/${month.toString().padStart(2, '0')}/${year}`;
        return { dataInicial, dataFinal };
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatNumber = (value) => {
        if (value === null || value === undefined) return '';
        return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
    };

    const formatDate = (value) => {
        if (!value) return '';
        try {
            const date = new Date(value);
            return date.toLocaleDateString('pt-BR'); // Apenas dia/mês/ano
        } catch {
            return '';
        }
    };



    const fetchData = async () => {
        const { year, month } = filters;
        const { dataInicial, dataFinal } = generateDateRange(year, month);

        setLoading(true);
        try {
            const [custoFixoResponse, cargasExpedidasResponse, movtoEstoqueResponse, requisicoesResponse, notasResponse, projetadasResponse, producaoSGResponse, expedicaoSGResponse, producaoPlannixResponse, montagemPlannixResponse, rhDadosResponse, nfEntradaResponse] = await Promise.all([
                axios.get('http://192.168.0.249:5000/api/sg/custo-fixo', {
                    params: { ano: year, mes: month },
                }),
                axios.get('http://179.124.195.91:1890/ADM_BPM/api/bi/cargasexpedidas', {
                    params: { dataInicial, dataFinal },
                }),
                axios.get('http://192.168.0.249:5000/api/sg/movtoestoque', {
                    params: { ano: year, mes: month },
                }),
                axios.get('http://192.168.0.249:5000/api/sg/requisicoes', {
                    params: { ano: year, mes: month }
                }),

                axios.get('http://192.168.0.249:5000/api/sg/notas', {
                    params: { ano: year, mes: month },
                }),
                axios.get('http://192.168.0.249:5000/api/sg/projetadas', {
                    params: { ano: year, mes: month, sigla: '%' },
                }),
                axios.get('http://192.168.0.249:5000/api/sg/producao-sg', {
                    params: { ano: year, mes: month },
                }),
                axios.get('http://192.168.0.249:5000/api/sg/expedicao-sg', {
                    params: { ano: year, mes: month },
                }),
                axios.get('http://192.168.0.249:5000/api/sg/producaoPlannix', {
                    params: { ano: year, mes: month },
                }),
                axios.get('http://192.168.0.249:5000/api/sg/montagemPlannix', {
                    params: { ano: year, mes: month, sigla: '%' },
                }),
                axios.get('http://192.168.0.249:5000/api/sg/rh-dados', {
                    params: { ano: year, mes: month },
                }),
                axios.get('http://192.168.0.249:5000/api/sg/nf-entrada', {
                    params: { ano: year, mes: month },
                }),
            ]);

            // Formatar os dados de Custo Fixo
            const formattedCustoFixo = custoFixoResponse.data.map((row) => ({
                id_unico: row.id_unico,
                numeroprojeto: row.numeroprojeto,
                referencia: row.referencia,
                descricao: row.descricao,
                grupo: row.grupo,
                qt: parseFloat(row.qt),
                valor: parseFloat(row.valor),
                valor_total: parseFloat(row.valor_total),
                idtransacao: row.idtransacao,
                transacao: row.transacao,
                geraestoque: row.geraestoque,
                numeronf: row.numeronf,
                idcfop: row.idcfop,
                cfop: row.cfop,
                condicao_pag: row.condicao_pag,
                dataemissao: new Date(row.dataemissao).toLocaleDateString('pt-BR'),
                datasaida: new Date(row.datasaida).toLocaleDateString('pt-BR'),
            }));

            // Formatar os dados de Custo Fixo
            const formattednfEntrada = nfEntradaResponse.data.map((row) => ({
                id_unico: row.id_unico,
                numeroprojeto: row.numeroprojeto,
                referencia: row.referencia,
                descricao: row.descricao,
                grupo: row.grupo,
                qt: parseFloat(row.qt),
                valor: parseFloat(row.valor),
                valortotal: parseFloat(row.valortotal),
                idtransacao: row.idtransacao,
                transacao: row.transacao,
                geraestoque: row.geraestoque,
                numero: row.numero,
                idcfop: row.idcfop,
                cfop: row.cfop,
                condicao_pag: row.condicao_pag,
                dataemissao: new Date(row.dataemissao).toLocaleDateString('pt-BR'),
                dataentrada: new Date(row.dataentrada).toLocaleDateString('pt-BR'),
            }));


            // Processar e formatar os dados de Cargas Expedidas
            const processedCargasExpedidas = cargasExpedidasResponse.data.flatMap((row, index) =>
                row.pecas.map((peca, index) => ({
                    id_unico: `${row.codProgCargas}-${peca.CodigoControle}-${index}`,
                    Data: new Date(row.Data).toLocaleDateString('pt-BR'),
                    codProgCargas: row.codProgCargas,
                    siglaObra: row.siglaObra,
                    nomeObra: row.nomeObra,
                    nomePeca: peca.NomePeca,
                    CodigoControle: peca.CodigoControle,
                    Peso: parseFloat(peca.Peso),
                }))
            );

            const formattedMovtoEstoque = movtoEstoqueResponse.data.map((row) => ({
                id_unico: row.id_unico,
                empresa: row.empresa,
                data: new Date(row.data).toLocaleDateString('pt-BR'),
                projeto: row.projeto,
                codigo: row.codigo,
                rotulo: row.rotulo,
                entradasaida: row.entradasaida,
                quantidade: parseFloat(row.quantidade),
                origem: row.origem,
                motivo: row.motivo,
                volume: parseFloat(row.volume),
            }));

            const formattedRequisicao = requisicoesResponse.data.map((row) => ({
                id_unico: row.id_unico,
                data: new Date(row.data).toLocaleDateString('pt-BR'),
                referencia: row.referencia,
                idfilial: row.idfilial,
                descricao: row.descricao,
                quantidade_usada: parseFloat(row.quantidade_usada),
                valor_customedio: parseFloat(row.valor_customedio),
                idgrupo: row.idgrupo,
                desc_grupo: row.desc_grupo,
                unidade: row.unidade,
                idcontacontabil: row.idcontacontabil,
                numero_projeto: row.numero_projeto,
                nome_projeto: row.nome_projeto,
                idrequisicao: row.idrequisicao,
            }));

            const formattedNotas = notasResponse.data.map((row) => ({
                id_unico: row.id_unico,
                idfilial: row.idfilial,
                idnfe: row.idnfe,
                numero: row.numero,
                numero_projeto: row.numero_projeto,
                nome_projeto: row.nome_projeto,
                dataemissao: new Date(row.dataemissao).toLocaleDateString('pt-BR'),
                dataentrada: new Date(row.dataentrada).toLocaleDateString('pt-BR'),
                valor: parseFloat(row.valor),
                fantasia: row.fantasia,
                idserie: row.idserie,
                idcontadebitar: row.idcontadebitar,
                class_debito: row.class_debito, // cLassificação
                conta_debito: row.conta_debito, //aqui é a descrição na verdade
            }))

            const formattedProjetadas = projetadasResponse.data.map((row, index) => ({
                id_unico: `${row.codPeca}-${row.codigoControle}-${index}`,
                unidade: row.Unidade,
                nomeObra: row.nomeObra,
                siglaObra: row.siglaObra,
                data: new Date(row.Data).toLocaleDateString('pt-BR'),
                faseProducao: row.FaseProducao,
                nomePeca: row.nomePeca,
                codPeca: row.codPeca,
                codigoControle: row.codigoControle,
                volume: parseFloat(row.volume),
                peso: parseFloat(row.peso),
                comprimento: parseFloat(row.comprimento),
                traco: row.traco,
                equipe: row.equipe,
                classe: row.classe,
                codAuxiliarObra: row.codAuxiliarObra,
                codAuxiliarProduto: row.codAuxiliarProduto,
                codAuxiliarGrupo: row.codAuxiliarGrupo,
                quantidade: row.quantidade,
                area: row.area,
                largura: row.largura,
                pesoTotalPeca: row.pesoTotalPeca,
                pesoTotalAco: row.pesoTotalAco,
                produto: row.produto,
                grupo: row.grupo,
                secao: row.secao,
                infoAdicional: row.infoAdicional,
                tabelaAco: row.tabelaAco
            }));

            const formattedProducaoSG = producaoSGResponse.data.map((row) => ({
                id_unico: row.id_unico,
                linha: row.linha?.trim(), // Remove espaços desnecessários
                codigo: row.codigo,
                rotulo: row.rotulo,
                idobra: row.idobra,
                nomeobra: row.nomeobra?.trim(),
                data: new Date(row.data).toLocaleDateString('pt-BR'),
                descricao_traco: row.descricao_traco,
                volume_produzido: parseFloat(row.volume_produzido),
                area_produzida: parseFloat(row.area_produzida),
                comprimento_produzido: parseFloat(row.comprimento_produzido),
                qtde_produzida: parseFloat(row.qtde_produzida),
                taxa_ca: parseFloat(row.taxa_ca),
                taxa_cp: parseFloat(row.taxa_cp),
            }));

            const formattedExpedicaoSG = expedicaoSGResponse.data.map((row) => ({
                id_unico: row.id_unico,
                linha: row.linha?.trim(),
                codigo: row.codigo,
                rotulo: row.rotulo,
                idobra: row.idobra,
                nomeobra: row.nomeobra?.trim(),
                data: new Date(row.data).toLocaleDateString('pt-BR'),
                descricao_traco: row.descricao_traco?.trim(),
                volume_expedido: parseFloat(row.volume_expedido),
                area_expedida: parseFloat(row.area_expedida),
                comprimento_expedido: parseFloat(row.comprimento_expedido),
                qtde_expedida: parseFloat(row.qtde_expedida),
                taxa_ca: parseFloat(row.taxa_ca),
                taxa_cp: parseFloat(row.taxa_cp),
            }));

            const formattedProducaoPlannix = producaoPlannixResponse.data.map((row, index) => ({
                id_unico: `${row.Grupo}-${row.codigoControle}-${index}`,
                Unidade: row.Unidade,
                nomeObra: row.nomeObra,
                siglaObra: row.siglaObra,
                Data: new Date(row.Data).toLocaleDateString('pt-BR'),
                FaseProducao: row.FaseProducao,
                nomePeca: row.nomePeca,
                codigoControle: row.codigoControle,
                volume: parseFloat(row.volume),
                volumeReal: parseFloat(row.volumeReal),
                peso: parseFloat(row.peso),
                taxaAco: parseFloat(row.taxaAco),
                pesoAcoFrouxo: row.pesoAcoFrouxo,
                pesoArmacao: row.pesoArmacao,
                comprimento: parseFloat(row.comprimento),
                forma: row.forma,
                traco: row.traco,
                equipe: row.equipe,
                expedirArmacao: row.expedirArmacao,
                Produto: row.Produto,
                Grupo: row.Grupo,
                Secao: row.Secao,
                Detalhe: row.Detalhe,
                codAuxiliarObra: row.codAuxiliarObra,
                codAuxiliarProduto: row.codAuxiliarProduto,
                codAuxiliarGrupo: row.codAuxiliarGrupo,
                rateado: row.rateado,
            }));

            const formattedmontagemPlannix = montagemPlannixResponse.data.map((row, index) => ({
                id_unico: `${row.codPeca}-${row.codigoControle}-${index}`,
                nomeObra: row.nomeObra,
                siglaObra: row.siglaObra,
                Data: new Date(row.Data).toLocaleDateString('pt-BR'),
                FaseProducao: row.FaseProducao,
                nomePeca: row.nomePeca,
                codPeca: row.codPeca,
                codigoControle: row.codigoControle,
                volume: parseFloat(row.volume),
                area: row.area,
                largura: row.largura,
                peso: parseFloat(row.peso),
                comprimento: row.comprimento,
                numeroCarga: row.numeroCarga,
                equipe: row.equipe,
                responsavelEquipe: row.responsavelEquipe,
                codEquipe: row.codEquipe,
                classe: row.classe,
                codAuxiliarObra: row.codAuxiliarObra,
                codAuxiliarProduto: row.codAuxiliarProduto,
                codAuxiliarGrupo: row.codAuxiliarGrupo,
                produto: row.produto,
                grupo: row.grupo,
                secao: row.secao,
                detalhe: row.detalhe,
                componentesEquipe: row.componentesEquipe,
            }));

            const formattedrhDados = rhDadosResponse.data.map((row) => ({
                id_unico: row.id_unico,
                cred: parseFloat(row.cred),
                numloc: row.numloc,
                codloc: row.codloc,
                nomloc: row.nomloc,
                ferias: parseFloat(row.ferias),
                decimo: parseFloat(row.decimo),
            }));

            setData({
                custoFixo: formattedCustoFixo,
                nfEntrada: formattednfEntrada,
                cargasExpedidas: processedCargasExpedidas,
                movtoEstoque: formattedMovtoEstoque,
                requisicoes: formattedRequisicao,
                notas: formattedNotas,
                projetadas: formattedProjetadas,
                producaoSG: formattedProducaoSG,
                expedicaoSG: formattedExpedicaoSG,
                producaoPlannix: formattedProducaoPlannix,
                montagemPlannix: formattedmontagemPlannix,
                rhDados: formattedrhDados,
            });
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    };
/*  */

    const custoFixoColumns = useMemo(() => [
        { field: 'referencia', headerName: 'Referência', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'numeroprojeto', headerName: 'Número do Projeto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'descricao', headerName: 'Descrição', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'grupo', headerName: 'Grupo', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'qt', headerName: 'Quantidade', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'valor', headerName: 'Valor', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'valor_total', headerName: 'Valor Total', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'idtransacao', headerName: 'ID Transação', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'transacao', headerName: 'Transação', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'geraestoque', headerName: 'Gera Estoque', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'numeronf', headerName: 'Número Nota Fiscal', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'idcfop', headerName: 'ID CFOP', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'cfop', headerName: 'CFOP', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'condicao_pag', headerName: 'Condição Pagamento', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'dataemissao', headerName: 'Data Emissão', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'datasaida', headerName: 'Data Saída', fflex: 1, minWidth: 120, sortable: true, resizable: true },
    ], []);

    const nfEntradaColumns = useMemo(() => [
        { field: 'referencia', headerName: 'Referência', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'numeroprojeto', headerName: 'Número do Projeto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'descricao', headerName: 'Descrição', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'grupo', headerName: 'Grupo', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'qt', headerName: 'Quantidade', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'valor', headerName: 'Valor', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'valortotal', headerName: 'Valor Total', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'idtransacao', headerName: 'ID Transação', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'transacao', headerName: 'Transação', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'geraestoque', headerName: 'Gera Estoque', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'numero', headerName: 'Número Nota Fiscal', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'idcfop', headerName: 'ID CFOP', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'cfop', headerName: 'CFOP', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'condicao_pag', headerName: 'Condição Pagamento', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'dataemissao', headerName: 'Data Emissão', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'dataentrada', headerName: 'Data Entrada', fflex: 1, minWidth: 120, sortable: true, resizable: true },
    ], []);

    const cargasExpedidasColumns = useMemo(() => [
        { field: 'Data', headerName: 'Data', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codProgCargas', headerName: 'Nº da Carga', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'siglaObra', headerName: 'Obra', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'nomeObra', headerName: 'Nome da Obra', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'nomePeca', headerName: 'Nome da Peça', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'CodigoControle', headerName: 'Código Controle', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'Peso', headerName: 'Peso', flex: 1, minWidth: 120, sortable: true, resizable: true },
    ], []);

    const movtoEstoqueColumns = useMemo(() => [
        { field: 'empresa', headerName: 'Empresa', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'data', headerName: 'Data', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'projeto', headerName: 'Projeto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codigo', headerName: 'Código', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'rotulo', headerName: 'Rótulo', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'entradasaida', headerName: 'Entrada/Saída', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'quantidade', headerName: 'Quantidade', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'origem', headerName: 'Origem', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'motivo', headerName: 'Motivo', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'volume', headerName: 'Volume', flex: 1, minWidth: 120, sortable: true, resizable: true },
    ], []);

    const requisicoesColumns = useMemo(() => [
        { field: 'idfilial', headerName: 'Filial', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'data', headerName: 'Data', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'referencia', headerName: 'Referência', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'descricao', headerName: 'Descrição', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'idgrupo', headerName: 'Grupo', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'desc_grupo', headerName: 'Descrição Grupo', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'unidade', headerName: 'Unidade', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'quantidade_usada', headerName: 'Quantidade Usada', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'valor_customedio', headerName: 'Valor Custo Médio', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'idcontacontabil', headerName: 'Conta Contábil', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'numero_projeto', headerName: 'Número Projeto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'nome_projeto', headerName: 'Nome Projeto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'idrequisicao', headerName: 'ID Requisição', flex: 1, minWidth: 120, sortable: true, resizable: true },
    ], []);

    const notasColumns = useMemo(() => [
        { field: 'idfilial', headerName: 'Empresa', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'idnfe', headerName: 'IDNFE EMA', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'numero', headerName: 'Número Nota:', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'idserie', headerName: 'Série', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'numero_projeto', headerName: 'Número Projeto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'nome_projeto', headerName: 'Nome Projeto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'dataemissao', headerName: 'Emissão', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'dataentrada', headerName: 'Entrada', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'valor', headerName: 'Valor', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'fantasia', headerName: 'Fornecedor', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'idcontadebitar', headerName: 'Conta', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'class_debito', headerName: 'Classificação Conta', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'conta_debito', headerName: 'Descrição Conta', flex: 1, minWidth: 120, sortable: true, resizable: true },
    ], []);

    const projetadasColumns = useMemo(() => [
        { field: 'unidade', headerName: 'Unidade', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'nomeObra', headerName: 'Obra', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'siglaObra', headerName: 'Sigla Obra', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'data', headerName: 'Data', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'faseProducao', headerName: 'Fase Produção', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'nomePeca', headerName: 'Nome Peça', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codPeca', headerName: 'Código Peça', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codigoControle', headerName: 'Código Controle', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'volume', headerName: 'Volume (m³)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'peso', headerName: 'Peso (kg)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'comprimento', headerName: 'Comprimento (m)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'traco', headerName: 'Traço', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'equipe', headerName: 'Equipe', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'classe', headerName: 'Classe', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codAuxiliarObra', headerName: 'Cod Aux Obra', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codAuxiliarProduto', headerName: 'Cod Aux Produto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codAuxiliarGrupo', headerName: 'Cod Aux Grupo', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'quantidade', headerName: 'Quantidade', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'area', headerName: 'Área', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'Largura', headerName: 'Largura', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'pesoTotalPeca', headerName: 'Peso Total Peça', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'pesoTotalAco', headerName: 'Peso Total Aço', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'produto', headerName: 'Produto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'grupo', headerName: 'Grupo', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'secao', headerName: 'Seção', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'infoAdicional', headerName: 'Info Adicional', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'tabelaAco', headerName: 'tabela Aço', flex: 1, minWidth: 120, sortable: true, resizable: true },
    ], []);

    const producaoSGColumns = useMemo(() => [
        { field: 'linha', headerName: 'Linha', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'data', headerName: 'Data', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'idobra', headerName: 'Projeto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'nomeobra', headerName: 'Descrição Projeto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codigo', headerName: 'Código', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'rotulo', headerName: 'Rótulo', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'volume_produzido', headerName: 'Volume(m³)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'area_produzida', headerName: 'Área(m²)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'comprimento_produzido', headerName: 'Comprimento (m)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'qtde_produzida', headerName: 'Quantidade (pç)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'taxa_ca', headerName: 'Taxa CA (kg/m³)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'taxa_cp', headerName: 'Taxa CP (kg/m³)', fflex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'descricao_traco', headerName: 'Traço', flex: 1, minWidth: 120, sortable: true, resizable: true },
    ], []);

    const expedicaoSGColumns = useMemo(() => [
        { field: 'linha', headerName: 'Linha', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'data', headerName: 'Data', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'idobra', headerName: 'Projeto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'nomeobra', headerName: 'Descrição Projeto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codigo', headerName: 'Código', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'rotulo', headerName: 'Rótulo', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'volume_expedido', headerName: 'Volume (m³)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'area_expedida', headerName: 'Área (m²)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'comprimento_expedido', headerName: 'Comprimento (m)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'qtde_expedida', headerName: 'Quantidade (pç)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'taxa_ca', headerName: 'Taxa CA (kg/m³)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'taxa_cp', headerName: 'Taxa CP (kg/m³)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'descricao_traco', headerName: 'Traço', flex: 1, minWidth: 120, sortable: true, resizable: true },
    ], []);


    const producaoPlannixColumns = useMemo(() => [
        { field: 'Unidade', headerName: 'Unidade', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'nomeObra', headerName: 'Obra', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'siglaObra', headerName: 'Sigla Obra', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'Data', headerName: 'Data', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'FaseProducao', headerName: 'Fase Produção', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'nomePeca', headerName: 'Nome Peça', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codigoControle', headerName: 'Código Controle', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'volume', headerName: 'Volume (m³)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'volumeReal', headerName: 'Volume (m³)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'peso', headerName: 'Peso (kg)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'taxaAco', headerName: 'Taxa Aço', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'pesoAcoFrouxo', headerName: 'Peso Aço Frouxo', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'pesoArmacao', headerName: 'Peso Armação', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'comprimento', headerName: 'Comprimento', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'forma', headerName: 'Forma', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'traco', headerName: 'Traço', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'equipe', headerName: 'Equipe', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'expedirArmacao', headerName: 'Expedir Armação', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'Produto', headerName: 'Produto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'Grupo', headerName: 'Grupo', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'Secao', headerName: 'Seção', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'Detalhe', headerName: 'Detalhe', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codAuxiliarObra', headerName: 'Cod Aux Obra', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codAuxiliarProduto', headerName: 'Cod Aux Produto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codAuxiliarGrupo', headerName: 'Cod Aux Grupo', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'rateado', headerName: 'Rateado', flex: 1, minWidth: 120, sortable: true, resizable: true },
    ], []);

    const montagemPlannixColumns = useMemo(() => [
        { field: 'nomeObra', headerName: 'Obra', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'siglaObra', headerName: 'Sigla Obra', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'Data', headerName: 'Data', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'FaseProducao', headerName: 'Fase Produção', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'nomePeca', headerName: 'Nome Peça', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codPeca', headerName: 'Código Peça', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codigoControle', headerName: 'Código Controle', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'volume', headerName: 'Volume (m³)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'area', headerName: 'Área', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'largura', headerName: 'Largura', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'peso', headerName: 'Peso (kg)', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'comprimento', headerName: 'Comprimento', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'numeroCarga', headerName: 'Número Carga', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'equipe', headerName: 'equipe', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'responsavelEquipe', headerName: 'Responsável Equipe', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codEquipe', headerName: 'Código Equipe', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'classe', headerName: 'Classe', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codAuxiliarObra', headerName: 'Cod Aux Obra', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codAuxiliarProduto', headerName: 'Cod Aux Produto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'codAuxiliarGrupo', headerName: 'Cod Aux Grupo', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'produto', headerName: 'Produto', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'grupo', headerName: 'Grupo', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'secao', headerName: 'Seção', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'detalhe', headerName: 'Detalhe', flex: 1, minWidth: 120, sortable: true, resizable: true },
        { field: 'componentesEquipe', headerName: 'Componentes Equipe', flex: 1, minWidth: 120, sortable: true, resizable: true },
    ], []);

    const rhDadosColumns = useMemo(() => [
        { field: 'numloc', headerName: 'Setor', flex: 1, minWidth: 120 },
        { field: 'codloc', headerName: 'Local', flex: 1, minWidth: 120 },
        { field: 'nomloc', headerName: 'Nome Setor', flex: 1, minWidth: 120 },
        {
            field: 'cred',
            headerName: 'Salário',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <span>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.value)}
                </span>
            ),
        },
        {
            field: 'ferias',
            headerName: 'Férias',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <span>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.value)}
                </span>
            ),
        },
        {
            field: 'decimo',
            headerName: 'Décimo',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <span>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.value)}
                </span>
            ),
        },
    ], []);


    const exportToExcel = (rows, columns, filename = "export.xlsx") => {
        // Cria uma planilha com as colunas e linhas
        const header = columns.map((col) => col.headerName);
        const data = rows.map((row) =>
            columns.map((col) => row[col.field] || "") // Preenche com valor vazio se não existir
        );

        const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]); // Junta o cabeçalho e os dados
        const workbook = XLSX.utils.book_new(); // Cria o workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dados Exportados"); // Adiciona a planilha ao workbook

        // Gera o arquivo Excel
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

        // Baixa o arquivo
        saveAs(blob, filename);
    };

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <Tabs
                value={activeTab}
                onChange={handleChangeTab}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    mb: 2,
                    mt: { xs: 16, sm: 10 },
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                    overflowX: 'auto',
                }}
            >

                <Tab label="Notas Fiscais (Saída)" />
                <Tab label="Devolução" />
                <Tab label="Cargas Expedidas (Plannix)" />
                <Tab label="Movimentação de Estoque (Ema)" />
                <Tab label="Requisições" />
                <Tab label="Notas" />
                <Tab label="Projetado (Plannix)" />
                <Tab label="Produção (SG)" />
                <Tab label="Expedição (SG)" />
                <Tab label="Produção (Plannix)" />
                <Tab label="Montagem (Plannix)" />
                <Tab label="Salários" />
            </Tabs>
            <Paper elevation={3} sx={{ padding: 3, borderRadius: '8px' }}>
                {/* Filtros no canto direito */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: 1,
                        marginBottom: 2,
                    }}
                >
                    <Select
                        value={filters.year}
                        onChange={(e) => handleFilterChange('year', e.target.value)}
                        size="small"
                        sx={{
                            minWidth: 80,
                            fontSize: '0.9rem',
                            padding: '4px 8px',
                        }}
                    >
                        <MenuItem value="2025">2025</MenuItem>
                        <MenuItem value="2024">2024</MenuItem>
                        <MenuItem value="2023">2023</MenuItem>
                    </Select>
                    <Select
                        value={filters.month}
                        onChange={(e) => handleFilterChange('month', e.target.value)}
                        size="small"
                        sx={{
                            minWidth: 80,
                            fontSize: '0.9rem',
                            padding: '4px 8px',
                        }}
                    >
                        {[...Array(12)].map((_, i) => (
                            <MenuItem key={i} value={(i + 1).toString().padStart(2, '0')}>
                                {i + 1}
                            </MenuItem>
                        ))}
                    </Select>
                    <IconButton
                        onClick={fetchData}
                        disabled={loading}
                        sx={{
                            fontSize: '1rem',
                            padding: '6px',
                        }}
                    >
                        <FilterAltIcon fontSize="small" color="primary" />
                    </IconButton>
                    <IconButton
                        onClick={() => {
                            switch (activeTab) {
                                case 0:
                                    exportToExcel(data.custoFixo, custoFixoColumns, "nf_saida.xlsx");
                                    break;
                                case 1:
                                    exportToExcel(data.nfEntrada, nfEntradaColumns, "nf_entrada.xlsx");
                                    break;
                                case 2:
                                    exportToExcel(data.cargasExpedidas, cargasExpedidasColumns, "cargas_expedidas.xlsx");
                                    break;
                                case 3:
                                    exportToExcel(data.movtoEstoque, movtoEstoqueColumns, "movimentacao_estoque.xlsx");
                                    break;
                                case 4:
                                    exportToExcel(data.requisicoes, requisicoesColumns, "requisicoes.xlsx");
                                    break;
                                case 5:
                                    exportToExcel(data.notas, notasColumns, "notas.xlsx");
                                    break;
                                case 6:
                                    exportToExcel(data.projetadas, projetadasColumns, "projetadas.xlsx");
                                    break;
                                case 7:
                                    exportToExcel(data.producaoSG, producaoSGColumns, "producao_sg.xlsx");
                                    break;
                                case 8:
                                    exportToExcel(data.expedicaoSG, expedicaoSGColumns, "expedicao_sg.xlsx");
                                    break;
                                case 9:
                                    exportToExcel(data.producaoPlannix, producaoPlannixColumns, "producao_plannix.xlsx");
                                    break;
                                case 10:
                                    exportToExcel(data.montagemPlannix, montagemPlannixColumns, "montagem_plannix.xlsx");
                                    break;
                                case 11:
                                    exportToExcel(data.rhDados, rhDadosColumns, "salarios.xlsx");
                                    break;
                                default:
                                    console.error("Tab desconhecida.");
                            }
                        }}
                        sx={{
                            fontSize: '1rem',
                            padding: '6px',
                        }}
                    >
                        <DownloadIcon fontSize="small" color="primary" />
                    </IconButton>
                </Box>
                {/* Tabela */}
                {activeTab === 0 && <DataGridMemo rows={data.custoFixo} columns={custoFixoColumns} loading={loading} />}
                {activeTab === 1 && <DataGridMemo rows={data.nfEntrada} columns={nfEntradaColumns} loading={loading} />}
                {activeTab === 2 && <DataGridMemo rows={data.cargasExpedidas} columns={cargasExpedidasColumns} loading={loading} />}
                {activeTab === 3 && <DataGridMemo rows={data.movtoEstoque} columns={movtoEstoqueColumns} loading={loading} />}
                {activeTab === 4 && <DataGridMemo rows={data.requisicoes} columns={requisicoesColumns} loading={loading} />}
                {activeTab === 5 && <DataGridMemo rows={data.notas} columns={notasColumns} loading={loading} />}
                {activeTab === 6 && <DataGridMemo rows={data.projetadas} columns={projetadasColumns} loading={loading} />}
                {activeTab === 7 && <DataGridMemo rows={data.producaoSG} columns={producaoSGColumns} loading={loading} />}
                {activeTab === 8 && <DataGridMemo rows={data.expedicaoSG} columns={expedicaoSGColumns} loading={loading} />}
                {activeTab === 9 && <DataGridMemo rows={data.producaoPlannix} columns={producaoPlannixColumns} loading={loading} />}
                {activeTab === 10 && <DataGridMemo rows={data.montagemPlannix} columns={montagemPlannixColumns} loading={loading} />}
                {activeTab === 11 && <DataGridMemo rows={data.rhDados} columns={rhDadosColumns} loading={loading} />}
            </Paper>
        </ThemeProvider>
    );


}

export default OperationalCosts;
