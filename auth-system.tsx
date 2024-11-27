import React, { createContext, useContext, useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { User, FileText, Linkedin } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import TaskChecker from '@/components/TaskChecker';
import { UserMenu } from '@/components/UserMenu';
import { marked } from 'marked';
import MatrixRain from '@/components/MatrixRain';

// Create Auth Context with default values
interface User {
  username: string;
}

const AuthContext = createContext({
  user: null as User | null,
  login: (username: string, password: string) => false as boolean,
  logout: () => {},
  changePassword: (username: string, currentPassword: string, newPassword: string) => false as boolean
});

interface AuthProviderProps {
  children: React.ReactNode;
}

// Lista de usuários válidos
export let validUsers = [
  { username: 'lucas', password: '123456' },
  { username: 'luiz', password: '123456' },
  { username: 'kelvin', password: '123456' },
  { username: 'bruno', password: '123456' },
  { username: 'robson', password: '123456' },
  { username: 'fulano', password: '123456' },
  { username: 'natan', password: '123456' },
  { username: 'gabriel', password: '123456' }
];

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const foundUser = validUsers.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    
    if (foundUser) {
      setUser({ username: foundUser.username });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const changePassword = (username: string, currentPassword: string, newPassword: string) => {
    const userIndex = validUsers.findIndex(u => 
      u.username.toLowerCase() === username.toLowerCase()
    );

    if (userIndex === -1 || validUsers[userIndex].password !== currentPassword) {
      return false;
    }

    validUsers[userIndex].password = newPassword;
    return true;
  };

  const value = {
    user,
    login,
    logout,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Login Component
export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const savedTerms = localStorage.getItem('acceptedTerms');
    if (savedTerms === 'true') {
      setAcceptedTerms(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!acceptedTerms) {
      setError('Você precisa aceitar os termos de uso para continuar');
      return;
    }

    const success = login(username, password);
    if (!success) {
      setError('Usuário ou senha inválidos');
    }
  };

  const handleAcceptTerms = (checked: boolean) => {
    setAcceptedTerms(checked);
    if (typeof window !== 'undefined') {
      localStorage.setItem('acceptedTerms', checked.toString());
    }
  };

  const termsContent = `# Termos de Uso - Sistema de Gestão da República

## 1. Aceitação dos Termos
Ao utilizar este sistema, você concorda com estes termos de uso. O sistema é uma ferramenta para gerenciamento de tarefas e recursos compartilhados da república.

## 2. Uso do Sistema

### 2.1 Tarefas
- Cada usuário é responsável por completar suas tarefas designadas
- O sistema registra todas as atividades realizadas
- As tarefas devem ser marcadas como concluídas apenas quando efetivamente realizadas

### 2.2 Lavanderia
- Limite de 2 reservas por semana por usuário
- Máximo de 1 reserva no mesmo período (manhã/tarde)
- Reservas podem ser feitas com até 14 dias de antecedência
- Horários:
  - Manhã: 8h às 14h
  - Tarde/Noite: 14h às 22h

## 3. Responsabilidades dos Usuários
- Manter suas credenciais de acesso seguras
- Respeitar os horários e limites de uso dos recursos compartilhados
- Comunicar problemas ou irregularidades aos administradores
- Contribuir para a manutenção da organização e limpeza dos espaços comuns`;

  return (
    <div className="login-page">
      <MatrixRain />
      <Card className="w-[95%] max-w-md relative z-10 mx-2 login-card">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center flex flex-col items-center gap-2 sm:gap-3">
            <User className="w-10 h-10 sm:w-12 sm:h-12 login-icon" />
            <div className="flex flex-col items-center">
              <span className="login-title text-2xl sm:text-3xl mb-1">402 HUB</span>
              <span className="login-subtitle text-base sm:text-lg">[SYSTEM LOGIN]</span>
            </div>
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
            {error && (
              <div className="login-error text-sm text-center p-3 rounded">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium login-label tracking-wide">
                USERNAME
              </label>
              <Input
                type="text"
                className="login-input font-mono tracking-wider text-sm text-black"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="_"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium login-label tracking-wide">
                PASSWORD
              </label>
              <Input
                type="password"
                className="login-input font-mono tracking-wider text-sm text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="_"
              />
            </div>
            <div className="flex items-center space-x-2 login-terms-container p-2 sm:p-3 rounded">
              <Checkbox
                id="terms"
                className="login-checkbox"
                checked={acceptedTerms}
                onCheckedChange={handleAcceptTerms}
              />
              <label
                htmlFor="terms"
                className="text-xs sm:text-sm login-label"
              >
                ACEITO OS{' '}
                <Dialog open={showTerms} onOpenChange={setShowTerms}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="login-link text-xs inline-flex items-center p-0">
                      TERMOS DE USO
                      <FileText className="w-3 h-3 ml-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="login-dialog fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[95%] sm:w-[90%] max-w-lg h-[90vh] sm:h-[80vh] p-3 sm:p-4 flex flex-col bg-zinc-900">
                    <DialogHeader className="mb-2 flex-shrink-0">
                      <DialogTitle className="login-dialog-title text-center text-lg sm:text-xl tracking-wider text-white">
                        [TERMOS DE USO]
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 rounded login-terms-content overflow-y-auto">
                      <div className="p-2 sm:p-4">
                        <div 
                          className="text-xs sm:text-sm text-white [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:font-bold [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-2"
                          dangerouslySetInnerHTML={{ 
                            __html: marked(termsContent, {
                              gfm: true,
                              breaks: true
                            }) 
                          }}
                        />
                      </div>
                    </div>
                    <DialogClose asChild>
                      <Button className="login-button mt-3 w-full text-sm flex-shrink-0">
                        [FECHAR]
                      </Button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              </label>
            </div>
          </CardContent>
          <CardFooter className="p-4 sm:p-6 pt-0 flex flex-col gap-2 sm:gap-3">
            <Button
              type="submit"
              className="w-full login-button font-mono tracking-wider text-sm sm:text-base"
            >
              [INICIAR SESSÃO]
            </Button>
            <div className="text-center mt-4 text-xs login-footer">
              <div>Desenvolvido por Lucas Borges</div>
              <a 
                href="https://www.linkedin.com/in/luborgs/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center mt-1 login-social-link"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

// Main App Component that uses authentication
const App = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoginForm />
      </div>
    );
  }

  return <AppLayout />;
};

// App Layout Component
const AppLayout = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Redirecionando para login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Task Dashboard</h1>
          <UserMenu username={user.username} />
        </div>
        <TaskChecker currentUser={user.username} />
      </div>
    </div>
  );
};

export default App;