'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useToast } from '@/components/ui/Toast';
import { PortfolioItem, ItemCategory, AddItemFormData } from '@/lib/types';
import { availableItems } from '@/lib/mockData';
import { Search } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: PortfolioItem | null;
}

const categoryOptions = [
  { value: 'knife', label: '🔪 Нож' },
  { value: 'case', label: '📦 Кейс' },
  { value: 'skin', label: '🎨 Скин' },
  { value: 'sticker', label: '🏷️ Стикер' },
  { value: 'charm', label: '✨ Шарм' },
  { value: 'gloves', label: '🧤 Перчатки' },
  { value: 'weapon', label: '🔫 Оружие' },
  { value: 'other', label: '📌 Другое' },
];

export function AddItemModal({ isOpen, onClose, editItem }: AddItemModalProps) {
  const { addItem, updateItem } = usePortfolioStore();
  const toast = useToast();

  const [formData, setFormData] = useState<AddItemFormData>({
    name: '',
    category: 'case',
    image: '',
    icon: '📦',
    holdings: 1,
    avgBuyPrice: 0,
    purchaseDate: new Date(),
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddItemFormData, string>>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Заполнить форму при редактировании
  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        category: editItem.category,
        image: editItem.image,
        icon: editItem.icon,
        holdings: editItem.holdings,
        avgBuyPrice: editItem.avgBuyPrice,
        purchaseDate: editItem.purchaseDate,
      });
    } else {
      setFormData({
        name: '',
        category: 'case',
        image: '',
        icon: '📦',
        holdings: 1,
        avgBuyPrice: 0,
        purchaseDate: new Date(),
      });
    }
    setErrors({});
    setSearchQuery('');
  }, [editItem, isOpen]);

  // Фильтрация подсказок
  const suggestions = searchQuery
    ? availableItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelectItem = (item: typeof availableItems[0]) => {
    setFormData({
      ...formData,
      name: item.name,
      category: item.category,
      icon: item.icon,
      image: item.image,
    });
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AddItemFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }
    if (formData.holdings < 1) {
      newErrors.holdings = 'Количество должно быть больше 0';
    }
    if (formData.avgBuyPrice < 0) {
      newErrors.avgBuyPrice = 'Цена не может быть отрицательной';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (editItem) {
      updateItem(editItem.id, {
        name: formData.name,
        category: formData.category,
        image: formData.image,
        icon: formData.icon,
        holdings: formData.holdings,
        avgBuyPrice: formData.avgBuyPrice,
        purchaseDate: formData.purchaseDate,
      });
      toast.success(`"${formData.name}" обновлен`);
    } else {
      addItem({
        name: formData.name,
        category: formData.category,
        image: formData.image,
        icon: formData.icon,
        currentPrice: availableItems.find((i) => i.name === formData.name)?.currentPrice || formData.avgBuyPrice,
        holdings: formData.holdings,
        avgBuyPrice: formData.avgBuyPrice,
        purchaseDate: formData.purchaseDate,
      });
      toast.success(`"${formData.name}" добавлен в портфель`);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Редактировать предмет' : 'Добавить предмет'}
      description={editItem ? 'Измените информацию о предмете' : 'Заполните информацию о новом предмете'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Поиск предмета */}
        <div className="relative">
          <Input
            label="Поиск предмета"
            placeholder="Начните вводить название..."
            value={searchQuery || formData.name}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setFormData({ ...formData, name: e.target.value });
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            icon={<Search className="w-4 h-4" />}
          />
          
          {/* Подсказки */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
              {suggestions.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-slate-700/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  onClick={() => handleSelectItem(item)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-100 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.category}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Название */}
        <Input
          label="Название предмета"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        {/* Категория */}
        <Select
          label="Категория"
          options={categoryOptions}
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value as ItemCategory })
          }
        />

        {/* Количество и цена */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Количество"
            type="number"
            min="1"
            value={formData.holdings}
            onChange={(e) =>
              setFormData({ ...formData, holdings: parseInt(e.target.value) || 1 })
            }
            error={errors.holdings}
            required
          />
          <Input
            label="Средняя цена покупки (₽)"
            type="number"
            min="0"
            step="0.01"
            value={formData.avgBuyPrice}
            onChange={(e) =>
              setFormData({ ...formData, avgBuyPrice: parseFloat(e.target.value) || 0 })
            }
            error={errors.avgBuyPrice}
            required
          />
        </div>

        {/* Дата покупки */}
        <Input
          label="Дата покупки"
          type="date"
          value={formData.purchaseDate.toISOString().split('T')[0]}
          onChange={(e) =>
            setFormData({ ...formData, purchaseDate: new Date(e.target.value) })
          }
        />

        {/* Кнопки */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">
            {editItem ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
