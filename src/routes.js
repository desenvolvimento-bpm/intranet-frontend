import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
  MdFolderShared,
  MdTapAndPlay,
  MdPostAdd,
  MdOutlineWorkHistory 
} from 'react-icons/md';
// Admin Imports
import MainDashboard from 'views/admin/default';
import OperationalCosts from 'views/admin/operationalCosts';
import FichasEntrada from 'views/admin/fichas-entrada';
import FichaRepresentante from 'views/admin/teste-tela';
import Relatorio from 'views/admin/relatorioFechamento';
import Obras from 'views/admin/teste-plannix';
// Auth Import
import Login from 'pages/Login';

const routes = [
  {
    name: 'Main Dashboard',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
  },
  {
    name: 'Custos Operacionais', // Nova rota
    layout: '/admin',
    path: '/custos-operacionais',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />, // Ícone do Data Tables
    component: <OperationalCosts />, // Componente associado
  },
  {
    name: 'Relatorio', // Nova rota
    layout: '/admin',
    path: '/Relatorio',
    icon: <Icon as={MdPostAdd } width="20px" height="20px" color="inherit" />, // Ícone do Data Tables
    component: <Relatorio />, // Componente associado
  },

  {
    name: 'Cadastro de Fichas',
    layout: '/admin',
    path: '/fichas-entrada',
    icon: <Icon as={MdFolderShared} width="20px" height="20px" color="inherit" />,
    component: <FichasEntrada />,
    hidden: true,
  },
  {
    name: 'Fichas de Entrada',
    layout: '/admin',
    path: '/tela-teste',
    icon: <Icon as={MdFolderShared} width="20px" height="20px" color="inherit" />,
    component: <FichaRepresentante />,
  },
  {
    name: 'Teste Plannix',
    layout: '/admin',
    path: '/teste-plannix',
    icon: <Icon as={MdOutlineWorkHistory } width="20px" height="20px" color="inherit" />,
    component: <Obras />,
  },
  {
    name: 'Login', // Nova rota de login
    layout: '/auth',
    path: '/login',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <Login />,
    hidden: true,
  },
];

export default routes;
