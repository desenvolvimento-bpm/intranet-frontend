import { Flex, Image } from "@chakra-ui/react"; // Certifique-se de importar o Image e Flex
import { HSeparator } from "components/separator/Separator"; // Importação do Separator já existente

export function SidebarBrand() {
  return (
    <Flex align="center" direction="column">
      {/* Novo logo */}
      <Image
        src="/assets/images/bpm_logo.png" // Caminho para o novo logo
        alt="BPM Logo"
        h='100%'
        w='175px' // Altura do logo
        my="32px" // Margem ao redor
      />
      {/* Separator abaixo do logo */}
      <HSeparator mb="20px" />
    </Flex>
  );
}

export default SidebarBrand;
