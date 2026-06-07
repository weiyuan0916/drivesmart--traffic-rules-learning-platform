import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Đăng nhập</h1>
        <p className="text-muted-foreground">
          Chào mừng bạn quay trở lại
        </p>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Auth pages will be implemented in T-A-005 (Auth + API Client).
      </p>

      <div className="text-center">
        <Link to="/topics">
          <Button variant="secondary">Quay lại trang chủ</Button>
        </Link>
      </div>
    </div>
  )
}
