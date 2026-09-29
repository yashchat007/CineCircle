import { Link } from 'react-router-dom'
import { FilmIcon } from '../components/icons'
import { PageContainer } from '../components/Layout'
import { EmptyState } from '../components/States'

export default function NotFoundPage() {
  return (
    <PageContainer>
      <EmptyState
        icon={<FilmIcon />}
        title="Scene not found"
        message="The page you’re looking for doesn’t exist."
        action={
          <Link to="/" className="btn-primary">
            Go home
          </Link>
        }
      />
    </PageContainer>
  )
}
