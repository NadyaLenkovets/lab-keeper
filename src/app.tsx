import { ChakraProvider } from '@chakra-ui/react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router.tsx'
import { system } from '@/theme/chakra-theme.ts'

export function App() {
  return (
    <ChakraProvider value={system}>
      <RouterProvider router={router} />
    </ChakraProvider>
  )
}
