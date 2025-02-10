import React, { useState } from "react";
import { useAuth } from "contexts/AuthContext";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Flex,
} from "@chakra-ui/react";

function SignIn() {
  const { login } = useAuth();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");
      await login(nome, senha);
      window.location.href = "/admin"; // Redireciona após login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Flex direction="column" maxW="400px" mx="auto" mt="100px">
      <FormControl>
        <FormLabel>Nome</FormLabel>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} />
      </FormControl>
      <FormControl mt="4">
        <FormLabel>Senha</FormLabel>
        <Input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </FormControl>
      {error && (
        <Text color="red.500" mt="2">
          {error}
        </Text>
      )}
      <Button mt="4" colorScheme="blue" onClick={handleLogin}>
        Entrar
      </Button>
    </Flex>
  );
}

export default SignIn;
