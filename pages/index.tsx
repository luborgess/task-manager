import type { NextPage } from 'next'
import { useAuth, LoginForm } from '@/auth-system'
import TaskChecker from '@/components/TaskChecker'
import WeeklyLaundryCalendar from '@/components/WeeklyLaundryCalendar'
import { UserMenu } from '@/components/UserMenu'

const Home: NextPage = () => {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
        <LoginForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <UserMenu username={user.username} />
          </header>

          <main className="grid grid-cols-1 gap-6">
            <div className="bg-white/50 backdrop-blur-xl rounded-xl shadow-sm border border-white/20">
              <TaskChecker currentUser={user.username} />
            </div>
            <div className="bg-white/50 backdrop-blur-xl rounded-xl shadow-sm border border-white/20">
              <WeeklyLaundryCalendar currentUser={user.username} />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Home
