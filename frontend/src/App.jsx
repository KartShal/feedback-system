import React, { useState, useEffect } from 'react';

const Star = ({ filled, onClick }) => (
  <svg onClick={onClick} className={`w-10 h-10 cursor-pointer transition-colors ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function App() {
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [step, setStep] = useState('list');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/managers')
      .then(res => res.json())
      .then(data => setManagers(data))
      .catch(err => console.error("Ошибка:", err));
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerId: selectedManager.id, rating, comment })
      });
      setStep('thanks');
    } catch (err) {
      console.error("Ошибка:", err);
      alert('Ошибка при отправке отзыва');
    }
    setIsSubmitting(false);
  };

  if (step === 'list') {
    return (
      <div className="p-5 max-w-md mx-auto min-h-screen pb-10">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-6 mt-4">Оцените работу нашего менеджера</h1>
        <div className="space-y-4">
          {managers.length === 0 ? (
            <div className="text-center text-gray-500 py-10">Загрузка...</div>
          ) : managers.map(m => (
            <div key={m.id} onClick={() => { setSelectedManager(m); setStep('rate'); }} 
                 className="flex items-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] border border-gray-100">
              <img src={m.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`} alt={m.name} className="w-16 h-16 rounded-full object-cover mr-4 border border-gray-100" />
              <div>
                <h2 className="text-lg font-bold text-gray-800">{m.name}</h2>
                <p className="text-gray-400 text-sm">Оставить отзыв &rarr;</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'rate') {
    return (
      <div className="p-5 max-w-md mx-auto flex flex-col min-h-screen pb-6">
        <button onClick={() => setStep('list')} className="text-blue-500 font-medium self-start mb-6">&larr; Вернуться к списку</button>
        <div className="flex flex-col items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
          <img src={selectedManager.photoUrl} alt={selectedManager.name} className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-blue-50" />
          <h2 className="text-2xl font-bold text-gray-800">{selectedManager.name}</h2>
          <p className="text-gray-500 text-sm mt-1">Как вы оцениваете работу специалиста?</p>
        </div>
        <div className="mb-8 flex justify-center space-x-3">
          {[1,2,3,4,5].map(star => (
            <Star key={star} filled={star <= rating} onClick={() => setRating(star)} />
          ))}
        </div>
        <div className="flex-grow flex flex-col">
          <label className="text-sm font-semibold text-gray-600 mb-2 ml-1">Ваш комментарий (опционально)</label>
          <textarea placeholder="Что вам понравилось или что стоит улучшить?" 
                    className="w-full p-4 border border-gray-200 rounded-2xl mb-6 flex-grow bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none shadow-inner"
                    value={comment} onChange={e => setComment(e.target.value)} />
        </div>
        <button onClick={handleSubmit} disabled={rating === 0 || isSubmitting}
                className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:bg-gray-400 active:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
          {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto flex flex-col items-center justify-center min-h-screen text-center bg-white">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-800 mb-3">Спасибо!</h1>
      <p className="text-gray-500 mb-10 text-lg">Ваш отзыв успешно отправлен. Это помогает нам становиться лучше.</p>
      <button onClick={() => { setStep('list'); setRating(0); setComment(''); }} className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200 font-bold p-4 rounded-xl transition-colors">
        Оценить другого менеджера
      </button>
    </div>
  );
}
