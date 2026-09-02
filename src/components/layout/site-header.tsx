import { Box, Flex, HStack, Link, Text } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import { LogoIcon } from './logo-icon'

const noFocusRing = {
  outline: 'none',
  boxShadow: 'none',
  _focus: { outline: 'none', boxShadow: 'none' },
  _focusVisible: { outline: 'none', boxShadow: 'none' },
}

const navLinkStyle = {
  ...noFocusRing,
  color: 'fg.muted',
  fontWeight: '500',
  _hover: { color: 'accent' },
}

const links = [
  { to: '/main', label: 'Статьи' },
  { to: '/tests', label: 'Тесты' },
  { to: '/create', label: 'Journey' },
  { to: '/ask', label: 'Спросить' },
  { to: '/profile', label: 'Профиль' },
]

export function SiteHeader() {
  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      borderColor="border"
      bg="bg.canvas"
      px={8}
      py={4}
    >
      <Flex maxW="1200px" mx="auto" align="center" justify="space-between">
        <Link asChild {...noFocusRing} _hover={{ textDecoration: 'none' }}>
          <NavLink to="/main" style={{ outline: 'none' }}>
            <Box
              className="brand-link"
              display="inline-flex"
              px={2}
              py={1}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="transparent"
              transformOrigin="left center"
              transition="transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease, filter 0.35s ease"
              _hover={{
                transform: 'scale(1.05)',
                borderColor: 'rgba(190, 242, 100, 0.45)',
                boxShadow:
                  '0 0 0 1px rgba(190, 242, 100, 0.35), 0 0 14px rgba(132, 204, 22, 0.4), 0 0 28px rgba(132, 204, 22, 0.2)',
                filter: 'drop-shadow(0 0 8px rgba(190, 242, 100, 0.35))',
              }}
              css={{
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                  '&:hover': { transform: 'none' },
                },
              }}
            >
              <HStack gap={3}>
                <LogoIcon size={20} color="#84CC16" />
                <Text
                  fontWeight="600"
                  fontSize="lg"
                  color="#FFFFFF"
                  transition="color 0.35s ease, text-shadow 0.35s ease"
                  css={{
                    '.brand-link:hover &': {
                      color: '#BEF264',
                      textShadow:
                        '0 0 10px rgba(190, 242, 100, 0.55), 0 0 20px rgba(132, 204, 22, 0.25)',
                    },
                    '@media (prefers-reduced-motion: reduce)': {
                      transition: 'none',
                    },
                  }}
                >
                  Lab Keeper
                </Text>
              </HStack>
            </Box>
          </NavLink>
        </Link>

        <HStack gap={6}>
          {links.map((link) => (
            <Link key={link.to} asChild {...navLinkStyle}>
              <NavLink to={link.to} style={{ outline: 'none' }}>
                {link.label}
              </NavLink>
            </Link>
          ))}
        </HStack>
      </Flex>
    </Box>
  )
}
