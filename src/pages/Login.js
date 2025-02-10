import React, { useState } from "react";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
  Image,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import logo from './img/icone.png'; // Certifique-se de que o caminho do logo está correto.

function Login() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://192.168.0.249:5000/api/crm/login", {
        login,
        senha,
      });

      // Armazena o token na sessão
      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("iduser", response.data.iduser);
      sessionStorage.setItem("perfil", response.data.perfil);

      // Exibe mensagem de sucesso
      toast({
        title: "Login realizado com sucesso!",
        description: "Você será redirecionado em instantes.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Redireciona para o dashboard
      setTimeout(() => {
        window.location.href = "/admin/default";
      }, 1000);
    } catch (error) {
      console.error("Erro ao realizar login:", error.response?.data?.message);

      // Exibe mensagem de erro
      toast({
        title: "Erro ao realizar login",
        description: error.response?.data?.message || "Erro desconhecido.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      bg="#FFBF00" // Fundo amarelo
      minHeight="100vh"
      align="center"
      justify="center"
    >
      <Box
        bg="white" // Fundo branco do formulário
        p="2rem"
        borderRadius="16px"
        boxShadow="xl"
        maxWidth="400px"
        w="100%"
        textAlign="center"
      >
        {/* Logo */}
        <Image
          src={logo}
          alt="Logo da Empresa"
          mb="1rem"
          mx="auto"
          boxSize="120px"
        />

        {/* Texto de boas-vindas */}
        <Text fontSize="xl" fontWeight="bold" color="black" mb="1rem">
          Bem-vindo ao  /??
        </Text>

        <form onSubmit={handleLogin}>
          {/* Campo de Login */}
          <FormControl id="login" isRequired mb="1rem">
            <Input
              type="text"
              placeholder="Usuário"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              focusBorderColor="yellow.400"
              borderColor="yellow.400"
            />
          </FormControl>

          {/* Campo de Senha */}
          <FormControl id="senha" isRequired mb="1.5rem">
            <Input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              focusBorderColor="yellow.400"
              borderColor="#FFBF00"
            />
          </FormControl>

          {/* Botão de Login */}
          <Button
            type="submit"
            isLoading={loading}
            loadingText="Entrando"
            bg="#FFBF00"
            color="black"
            _hover={{ bg: "yellow.500" }}
            width="100%"
            fontWeight="bold"
          >
            Entrar
          </Button>
        </form>

        {/* Rodapé */}
        <Text mt="2rem" fontSize="sm" color="gray.500">
          © 2025 BPM - Todos os direitos reservados.
        </Text>
      </Box>
    </Flex>
  );
}

export default Login;
