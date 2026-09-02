import { Text } from '@chakra-ui/react'
import { Link, useParams } from 'react-router-dom'
import { TestRunner } from '@/components/test-runner'
import { getTestBySlug } from '@/content/tests-index'

export function TestRunPage() {
  const { slug } = useParams<{ slug: string }>()
  const test = slug ? getTestBySlug(slug) : undefined

  if (!test) {
    return (
      <Text color="#FFFFFF">
        Тест не найден.{' '}
        <Link to="/tests" style={{ color: '#84CC16' }}>
          К списку тестов
        </Link>
      </Text>
    )
  }

  return <TestRunner test={test} />
}
