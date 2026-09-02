import { Box, HStack, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

type NavBackLinkProps = {
  to: string
  label: string
}

export function NavBackLink({ to, label }: NavBackLinkProps) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <HStack
        gap={2}
        alignItems="center"
        color="#84CC16"
        fontWeight={600}
        transition="color 0.2s"
        _hover={{ color: '#BEF264' }}
      >
        <Box
          aria-hidden
          fontSize="22px"
          lineHeight="1"
          fontWeight={700}
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          minW="22px"
          color="inherit"
        >
          ←
        </Box>
        <Text fontSize="15px" lineHeight="1.25" color="inherit">
          {label}
        </Text>
      </HStack>
    </Link>
  )
}
