'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useToast } from '@/components/ui/Toast';
import {
  PortfolioItem,
  ItemCategory,
  AddItemFormData,
  CATEGORY_ICONS,
  CATEGORY_NAMES,
} from '@/lib/types';
import { availableItems } from '@/lib/mockData';
import { Search } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: PortfolioItem | null;
}

const categoryOptions = (Object.keys(CATEGORY_NAMES) as ItemCategory[]).map((category) => ({
  value: category,
  label: `${CATEGORY_ICONS[category]} ${CATEGORY_NAMES[category]}`,
}));

function createFormData(editItem?: PortfolioItem | null): AddItemFormData {
  if (editItem) {
    return {
      name: editItem.name,
      category: editItem.category,
      image: editItem.image,
      icon: editItem.icon,
      holdings: editItem.holdings,
      avgBuyPrice: editItem.avgBuyPrice,
      purchaseDate: editItem.purchaseDate,
    };
  }

  return {
    name: '',
    category: 'case',
    image: '',
    icon: CATEGORY_ICONS.case,
    holdings: 1,
    avgBuyPrice: 0,
    purchaseDate: new Date(),
  };
}

export function AddItemModal({ isOpen, onClose, editItem }: AddItemModalProps) {
  const { addItem, updateItem } = usePortfolioStore();
  const toast = useToast();
  const [formData, setFormData] = useState<AddItemFormData>(() => createFormData(editItem));
  const [errors, setErrors] = useState<Partial<Record<keyof AddItemFormData, string>>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormData(createFormData(editItem));
    setSearchQuery('');
    setShowSuggestions(false);
    setErrors({});
  }, [editItem, isOpen]);

  const suggestions = useMemo(
    () =>
      searchQuery
        ? availableItems
            .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 5)
        : [],
    [searchQuery]
  );

  const handleSelectItem = (item: (typeof availableItems)[number]) => {
    setFormData((prev) => ({
      ...prev,
      name: item.name,
      category: item.category,
      icon: item.icon,
      image: item.image,
    }));
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof AddItemFormData, string>> = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Название обязательно';
    }
    if (formData.holdings < 1) {
      nextErrors.holdings = 'Количество должно быть больше 0';
    }
    if (formData.avgBuyPrice < 0) {
      nextErrors.avgBuyPrice = 'Цена не может быть отрицательной';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (editItem) {
        await updateItem(editItem.id, {
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
        await addItem({
          name: formData.name,
          category: formData.category,
          image: formData.image,
          icon: formData.icon,
          currentPrice:
            availableItems.find((item) => item.name === formData.name)?.currentPrice ||
            formData.avgBuyPrice,
          holdings: formData.holdings,
          avgBuyPrice: formData.avgBuyPrice,
          purchaseDate: formData.purchaseDate,
        });
        toast.success(`"${formData.name}" добавлен в портфель`);
      }

      onClose();
    } catch (error) {
      const fallbackMessage = editItem
        ? 'Не удалось обновить предмет. Если у него есть история сделок, редактируйте транзакции отдельно.'
        : 'Не удалось добавить предмет';
      const message = error instanceof Error ? error.message : fallbackMessage;
      toast.error(message || fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Редактировать предмет' : 'Добавить предмет'}
      description={
        editItem
          ? 'Измените информацию о предмете.'
          : 'Заполните информацию о новом предмете.'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label="Поиск предмета"
            placeholder="Начните вводить название..."
            value={searchQuery || formData.name}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setFormData((prev) => ({ ...prev, name: event.target.value }));
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            icon={<Search className="w-4 h-4" />}
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 shadow-lg">
              {suggestions.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className="w-full rounded-none px-4 py-2 text-left transition-colors hover:bg-slate-700/50 first:rounded-t-lg last:rounded-b-lg"
                  onClick={() => handleSelectItem(item)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-100">{item.name}</p>
                      <p className="text-xs text-slate-400">{CATEGORY_NAMES[item.category]}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Input
          label="Название предмета"
          value={formData.name}
          onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
          error={errors.name}
          required
        />

        <Select
          label="Категория"
          options={categoryOptions}
          value={formData.category}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              category: event.target.value as ItemCategory,
              icon: CATEGORY_ICONS[event.target.value as ItemCategory],
            }))
          }
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Количество"
            type="number"
            min="1"
            value={formData.holdings}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                holdings: parseInt(event.target.value, 10) || 1,
              }))
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
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                avgBuyPrice: parseFloat(event.target.value) || 0,
              }))
            }
            error={errors.avgBuyPrice}
            required
          />
        </div>

        <Input
          label="Дата покупки"
          type="date"
          value={formData.purchaseDate.toISOString().split('T')[0]}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, purchaseDate: new Date(event.target.value) }))
          }
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {editItem ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
