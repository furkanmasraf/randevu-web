import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';// EĞER HATA DEVAM EDERSE süslü parantezleri kaldırıp "import API from..." yapabilirsin
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1); // 1: E-posta İsteği, 2: Yeni Şifre Belirleme
  const [email, setEmail] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // E-posta Gönderme Formu (Adım 1)
  const handleSendEmail = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/api/auth/forgot-password', { email });
      toast.success('Sıfırlama kodu e-posta adresinize gönderildi!');
      setStep(2); // Şifre belirleme adımına geçir
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'E-posta gönderilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Yeni Şifre Kaydetme Formu (Adım 2)
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.warning('Şifreler uyuşmuyor!');
      return;
    }
    if (newPassword.length < 6) {
      toast.warning('Şifre en az 6 karakter olmalıdır!');
      return;
    }
    setLoading(true);
    try {
      await API.post('/api/auth/reset-password', { token, newPassword });
      toast.success('Şifreniz başarıyla değiştirildi! Giriş yapabilirsiniz.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Şifre sıfırlanamadı. Kod geçersiz olabilir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Inter", sans-serif', backgroundColor: '#f8fafc', margin: 0
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', backgroundColor: '#fff',
        padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.75rem', fontWeight: 800 }}>
            {step === 1 ? 'Şifremi Unuttum' : 'Yeni Şifre Belirle'}
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>
            {step === 1 
              ? 'Hesabınıza kayıtlı e-posta adresinizi girin, size bir doğrulama kodu gönderelim.' 
              : 'E-postanıza gelen kodu ve kullanmak istediğiniz yeni şifreyi giriniz.'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '8px', letterSpacing: '0.05em' }}>E-POSTA ADRESİ</label>
              <input type="email" placeholder="isim@domain.com" required value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '0.95rem' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
              {loading ? 'Gönderiliyor...' : 'Sıfırlama Kodu Gönder'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>DOĞRULAMA KODU (TOKEN)</label>
              <input type="text" placeholder="E-postadaki kodu girin" required value={token} onChange={(e: ChangeEvent<HTMLInputElement>) => setToken(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>YENİ ŞİFRE</label>
              <input type="password" placeholder="••••••••" required value={newPassword} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>YENİ ŞİFRE (TEKRAR)</label>
              <input type="password" placeholder="••••••••" required value={confirmPassword} onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
              {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle ve Giriş Yap'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
            Giriş Sayfasına Dön
          </button>
        </div>

      </div>
    </div>
  );
}