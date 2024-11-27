import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '../auth-system';

const validUsers = [
  { username: 'lucas', password: '123456' },
  { username: 'luiz', password: '123456' },
  { username: 'kelvin', password: '123456' },
  { username: 'bruno', password: '123456' },
  { username: 'robson', password: '123456' },
  { username: 'fulano', password: '123456' },
  { username: 'natan', password: '123456' },
  { username: 'gabriel', password: '123456' }
];

export const ChangePassword = () => {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMessage('Usuário não autenticado');
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    const success = changePassword(user.username, currentPassword, newPassword);
    
    if (success) {
      setMessage('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
    } else {
      setMessage('Erro ao alterar senha. Verifique se a senha atual está correta.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium">
          Senha Atual
        </label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium">
          Nova Senha
        </label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>

      {message && (
        <p className={`text-sm ${message.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <Button type="submit" className="w-full">
        Alterar Senha
      </Button>
    </form>
  );
};
