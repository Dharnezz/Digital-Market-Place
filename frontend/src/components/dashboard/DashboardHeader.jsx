export default function DashboardHeader({ name }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        Welcome back, <span className="text-indigo-600">{name}</span>
      </h1>
      <p className="mt-1 text-sm text-gray-500">Manage your digital products from one place.</p>
    </div>
  )
}