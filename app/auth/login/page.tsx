import LoginForm from './LoginForm';

export const revalidate = 3600; // Static for 1 hour

export default function AuthLoginPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <LoginForm />
    </div>
  );
}
