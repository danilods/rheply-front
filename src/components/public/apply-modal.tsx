'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CheckCircle2,
  Upload,
  Clock,
  Bell,
  Shield,
  Loader2,
} from 'lucide-react';

const quickRegisterSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Voce deve aceitar os termos de uso',
  }),
});

type QuickRegisterForm = z.infer<typeof quickRegisterSchema>;

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  companyName: string;
  onRegisterSuccess?: () => void;
}

export function ApplyModal({
  isOpen,
  onClose,
  jobTitle,
  companyName,
  onRegisterSuccess,
}: ApplyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<QuickRegisterForm>({
    resolver: zodResolver(quickRegisterSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const acceptTerms = watch('acceptTerms');

  const onSubmit = async (_data: QuickRegisterForm) => {
    setIsLoading(true);
    // Simulate API call - TODO: Use _data to submit to backend
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setShowSuccess(true);

    setTimeout(() => {
      onRegisterSuccess?.();
      onClose();
      setShowSuccess(false);
    }, 2000);
  };

  const benefits = [
    {
      icon: Upload,
      text: 'Crie seu Perfil Universal uma vez',
    },
    {
      icon: Clock,
      text: 'Candidate-se com 1 clique',
    },
    {
      icon: Bell,
      text: 'Acompanhe suas candidaturas',
    },
    {
      icon: Shield,
      text: 'Seus dados protegidos pela LGPD',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {showSuccess ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Conta criada!</h3>
            <p className="text-muted-foreground">
              Redirecionando para completar sua candidatura...
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Crie sua conta gratuita
              </DialogTitle>
              <DialogDescription className="text-base">
                Para se candidatar a <strong>{jobTitle}</strong> na{' '}
                <strong>{companyName}</strong>, crie sua conta e acesse todos os
                beneficios.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <benefit.icon className="h-4 w-4 text-primary mr-2 shrink-0" />
                    <span className="text-muted-foreground">{benefit.text}</span>
                  </div>
                ))}
              </div>

              {/* Quick Register Form - method="POST" prevents credentials in URL */}
              <form
                method="POST"
                action=""
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(onSubmit)(e);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    {...register('name')}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register('email')}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) =>
                      setValue('acceptTerms', checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="acceptTerms"
                      className="text-sm text-muted-foreground leading-snug"
                    >
                      Concordo com os{' '}
                      <Link
                        href="/termos"
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        Termos de Uso
                      </Link>{' '}
                      e{' '}
                      <Link
                        href="/privacidade"
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        Politica de Privacidade
                      </Link>
                    </label>
                    {errors.acceptTerms && (
                      <p className="text-xs text-destructive">
                        {errors.acceptTerms.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar conta e candidatar-se'
                  )}
                </Button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Ja tem uma conta?{' '}
                  <Link
                    href="/login"
                    className="text-primary font-medium hover:underline"
                  >
                    Faca login
                  </Link>
                </p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
