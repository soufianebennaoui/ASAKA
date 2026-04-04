import React, { useState, useMemo, useCallback } from 'react';
import {
  Tag,
  Plus,
  Calendar,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Image,
  Percent,
  Gift,
  Sparkles,
  Moon,
  Sun,
  Heart,
  Zap,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Clock,
} from 'lucide-react';

const OffersModule = ({ offers = [], setOffers = () => {} }) => {
  const [editingOffer, setEditingOffer] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [searchFilter, setSearchFilter] = useState('all'); // all, active, scheduled, expired

  // Holiday type configurations
  const holidayTypes = {
    ramadan: { label: 'Ramadan', emoji: '🌙', color: 'bg-purple-900' },
    eid: { label: 'Aïd', emoji: '🎊', color: 'bg-pink-900' },
    'new-year': { label: 'Nouvel An', emoji: '🎆', color: 'bg-blue-900' },
    valentine: { label: 'Saint Valentin', emoji: '💝', color: 'bg-red-900' },
    summer: { label: 'Été', emoji: '☀️', color: 'bg-yellow-900' },
    custom: { label: 'Personnalisé', emoji: '🎉', color: 'bg-orange-900' },
  };

  // Calculate offer status
  const getOfferStatus = useCallback((offer) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(offer.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(offer.endDate);
    endDate.setHours(0, 0, 0, 0);

    if (!offer.isActive) return 'disabled';
    if (today < startDate) return 'scheduled';
    if (today > endDate) return 'expired';
    return 'active';
  }, []);

  // Calculate days remaining
  const getDaysRemaining = useCallback((endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, []);

  // Get active offers
  const activeOffers = useMemo(() => {
    return offers.filter((offer) => getOfferStatus(offer) === 'active');
  }, [offers, getOfferStatus]);

  // Filter offers based on search
  const filteredOffers = useMemo(() => {
    if (searchFilter === 'all') return offers;
    return offers.filter((offer) => getOfferStatus(offer) === searchFilter);
  }, [offers, searchFilter, getOfferStatus]);

  // Initialize new offer
  const handleNewOffer = () => {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setEditingOffer({
      id: Date.now().toString(),
      name: '',
      holidayType: 'custom',
      isActive: true,
      startDate,
      endDate,
      discountPercent: 10,
      slides: [
        {
          id: Date.now().toString(),
          imageUrl: '',
          title: '',
          subtitle: '',
          ctaText: 'Commander Maintenant',
        },
      ],
      deals: [],
      affectsAllMenu: true,
      showBanner: true,
      bannerColor: '#ff6b35',
    });
    setEditMode(true);
    setActiveTab('general');
  };

  // Edit existing offer
  const handleEditOffer = (offer) => {
    setEditingOffer({ ...offer });
    setEditMode(true);
    setActiveTab('general');
  };

  // Save offer
  const handleSaveOffer = () => {
    if (!editingOffer.name.trim()) {
      alert('Veuillez entrer un nom pour l\'offre');
      return;
    }
    if (editingOffer.slides.length === 0) {
      alert('Veuillez ajouter au moins une diapositive');
      return;
    }

    const existingIndex = offers.findIndex((o) => o.id === editingOffer.id);
    let updatedOffers;

    if (existingIndex >= 0) {
      updatedOffers = [...offers];
      updatedOffers[existingIndex] = editingOffer;
    } else {
      updatedOffers = [...offers, editingOffer];
    }

    setOffers(updatedOffers);
    setEditingOffer(null);
    setEditMode(false);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingOffer(null);
    setEditMode(false);
  };

  // Delete offer
  const handleDeleteOffer = (offerId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      setOffers(offers.filter((o) => o.id !== offerId));
    }
  };

  // Toggle offer active status
  const handleToggleActive = (offerId) => {
    const updated = offers.map((o) =>
      o.id === offerId ? { ...o, isActive: !o.isActive } : o
    );
    setOffers(updated);
  };

  // Update editing offer
  const updateEditingOffer = (updates) => {
    setEditingOffer((prev) => ({ ...prev, ...updates }));
  };

  // Add slide
  const handleAddSlide = () => {
    const newSlide = {
      id: Date.now().toString(),
      imageUrl: '',
      title: '',
      subtitle: '',
      ctaText: 'Commander Maintenant',
    };
    updateEditingOffer({
      slides: [...editingOffer.slides, newSlide],
    });
  };

  // Remove slide
  const handleRemoveSlide = (slideId) => {
    if (editingOffer.slides.length === 1) {
      alert('Vous devez avoir au moins une diapositive');
      return;
    }
    updateEditingOffer({
      slides: editingOffer.slides.filter((s) => s.id !== slideId),
    });
  };

  // Update slide
  const handleUpdateSlide = (slideId, updates) => {
    updateEditingOffer({
      slides: editingOffer.slides.map((s) =>
        s.id === slideId ? { ...s, ...updates } : s
      ),
    });
  };

  // Add deal
  const handleAddDeal = () => {
    const newDeal = {
      id: Date.now().toString(),
      name: '',
      description: '',
      originalPrice: 0,
      discountedPrice: 0,
    };
    updateEditingOffer({
      deals: [...editingOffer.deals, newDeal],
    });
  };

  // Remove deal
  const handleRemoveDeal = (dealId) => {
    updateEditingOffer({
      deals: editingOffer.deals.filter((d) => d.id !== dealId),
    });
  };

  // Update deal
  const handleUpdateDeal = (dealId, updates) => {
    updateEditingOffer({
      deals: editingOffer.deals.map((d) =>
        d.id === dealId ? { ...d, ...updates } : d
      ),
    });
  };

  // Reorder slides
  const handleMoveSlide = (slideId, direction) => {
    const index = editingOffer.slides.findIndex((s) => s.id === slideId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === editingOffer.slides.length - 1)
    ) {
      return;
    }

    const newSlides = [...editingOffer.slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSlides[index], newSlides[targetIndex]] = [
      newSlides[targetIndex],
      newSlides[index],
    ];
    updateEditingOffer({ slides: newSlides });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-900 text-green-200';
      case 'scheduled':
        return 'bg-blue-900 text-blue-200';
      case 'expired':
        return 'bg-red-900 text-red-200';
      case 'disabled':
        return 'bg-gray-700 text-gray-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'scheduled':
        return 'Planifié';
      case 'expired':
        return 'Expiré';
      case 'disabled':
        return 'Désactivé';
      default:
        return 'Inconnu';
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Offres & Promotions</h1>
            <p className="text-sm text-gray-400">Gérez les promotions saisonnières</p>
          </div>
        </div>
        <button
          onClick={handleNewOffer}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Offre
        </button>
      </div>

      {/* Active Offers Overview */}
      {activeOffers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Offres Actives Maintenant
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-[#242424] border border-[#333] rounded-lg p-4 hover:border-orange-500/50 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{offer.name}</h3>
                    <p className="text-xs text-gray-400">
                      {holidayTypes[offer.holidayType]?.emoji}{' '}
                      {holidayTypes[offer.holidayType]?.label}
                    </p>
                  </div>
                  <div className="bg-orange-500/20 px-3 py-1 rounded text-orange-400 font-bold text-sm">
                    -{offer.discountPercent}%
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {getDaysRemaining(offer.endDate)} jours restants
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Gift className="w-4 h-4 text-gray-500" />
                    {offer.slides.length} diapositives
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditOffer(offer)}
                    className="flex-1 px-3 py-2 bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 rounded text-sm font-medium transition"
                  >
                    <Edit className="w-4 h-4 inline mr-1" />
                    Éditer
                  </button>
                  <button
                    onClick={() => handleToggleActive(offer.id)}
                    className="px-3 py-2 bg-gray-700/40 hover:bg-gray-700/60 text-gray-300 rounded text-sm transition"
                  >
                    {offer.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 border-b border-[#333] pb-4">
        {[
          { value: 'all', label: 'Toutes les offres' },
          { value: 'active', label: 'Actives' },
          { value: 'scheduled', label: 'Planifiées' },
          { value: 'expired', label: 'Expirées' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSearchFilter(filter.value)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              searchFilter === filter.value
                ? 'bg-orange-500 text-white'
                : 'bg-[#242424] text-gray-300 hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* All Offers List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">
          {filteredOffers.length} Offre{filteredOffers.length !== 1 ? 's' : ''}
        </h2>

        {filteredOffers.length === 0 ? (
          <div className="bg-[#242424] border border-dashed border-[#444] rounded-lg p-8 text-center">
            <Gift className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucune offre trouvée</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredOffers.map((offer) => {
              const status = getOfferStatus(offer);
              return (
                <div
                  key={offer.id}
                  className="bg-[#242424] border border-[#333] rounded-lg p-4 flex items-center justify-between hover:border-orange-500/50 transition"
                >
                  <div className="flex-1 flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: offer.bannerColor + '20' }}
                    >
                      {holidayTypes[offer.holidayType]?.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-white">{offer.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(status)}`}>
                          {getStatusLabel(status)}
                        </span>
                        {offer.showBanner && (
                          <span className="text-xs px-2 py-1 rounded bg-orange-900 text-orange-200">
                            Bannière
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 flex items-center gap-4">
                        <span>{offer.startDate} → {offer.endDate}</span>
                        <span>{offer.slides.length} diapositive{offer.slides.length !== 1 ? 's' : ''}</span>
                        <span>{offer.deals.length} deal{offer.deals.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditOffer(offer)}
                      className="p-2 bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 rounded transition"
                      title="Éditer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(offer.id)}
                      className="p-2 bg-gray-700/40 hover:bg-gray-700/60 text-gray-300 rounded transition"
                      title={offer.isActive ? 'Désactiver' : 'Activer'}
                    >
                      {offer.isActive ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="p-2 bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {editMode && editingOffer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#242424] border-b border-[#333] p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {offers.find((o) => o.id === editingOffer.id)
                  ? 'Éditer l\'Offre'
                  : 'Nouvelle Offre'}
              </h2>
              <button
                onClick={handleCancelEdit}
                className="p-1 hover:bg-[#333] rounded transition"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-0 border-b border-[#333] bg-[#242424] sticky top-16 z-40">
              {[
                { id: 'general', label: 'Général', icon: Tag },
                { id: 'slides', label: 'Diapositives', icon: Image },
                { id: 'deals', label: 'Réductions', icon: Percent },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium border-b-2 transition ${
                    activeTab === id
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 space-y-6">
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom de l'offre
                    </label>
                    <input
                      type="text"
                      value={editingOffer.name}
                      onChange={(e) =>
                        updateEditingOffer({ name: e.target.value })
                      }
                      placeholder="ex. Ramadan 2024"
                      className="w-full bg-[#242424] border border-[#333] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Holiday Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type de Fête
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(holidayTypes).map(([key, { label, emoji }]) => (
                        <button
                          key={key}
                          onClick={() =>
                            updateEditingOffer({ holidayType: key })
                          }
                          className={`p-3 rounded-lg border-2 text-center transition ${
                            editingOffer.holidayType === key
                              ? 'border-orange-500 bg-orange-500/10'
                              : 'border-[#333] bg-[#242424] hover:border-orange-500/50'
                          }`}
                        >
                          <div className="text-2xl mb-1">{emoji}</div>
                          <div className="text-sm text-gray-300">{label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date de Début
                      </label>
                      <input
                        type="date"
                        value={editingOffer.startDate}
                        onChange={(e) =>
                          updateEditingOffer({ startDate: e.target.value })
                        }
                        className="w-full bg-[#242424] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date de Fin
                      </label>
                      <input
                        type="date"
                        value={editingOffer.endDate}
                        onChange={(e) =>
                          updateEditingOffer({ endDate: e.target.value })
                        }
                        className="w-full bg-[#242424] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Active & Banner Toggle */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-[#242424] rounded-lg border border-[#333]">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={editingOffer.isActive}
                        onChange={(e) =>
                          updateEditingOffer({ isActive: e.target.checked })
                        }
                        className="w-5 h-5 rounded accent-orange-500"
                      />
                      <label htmlFor="isActive" className="text-gray-300 font-medium cursor-pointer flex-1">
                        Offre Active
                      </label>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#242424] rounded-lg border border-[#333]">
                      <input
                        type="checkbox"
                        id="showBanner"
                        checked={editingOffer.showBanner}
                        onChange={(e) =>
                          updateEditingOffer({ showBanner: e.target.checked })
                        }
                        className="w-5 h-5 rounded accent-orange-500"
                      />
                      <label htmlFor="showBanner" className="text-gray-300 font-medium cursor-pointer flex-1">
                        Afficher en Bannière
                      </label>
                    </div>
                  </div>

                  {/* Banner Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Couleur de la Bannière
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={editingOffer.bannerColor}
                        onChange={(e) =>
                          updateEditingOffer({ bannerColor: e.target.value })
                        }
                        className="w-12 h-12 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingOffer.bannerColor}
                        onChange={(e) =>
                          updateEditingOffer({ bannerColor: e.target.value })
                        }
                        className="flex-1 bg-[#242424] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Slides Tab */}
              {activeTab === 'slides' && (
                <div className="space-y-6">
                  {editingOffer.slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className="bg-[#242424] border border-[#333] rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">
                          Diapositive {index + 1}
                        </h3>
                        <div className="flex items-center gap-2">
                          {index > 0 && (
                            <button
                              onClick={() => handleMoveSlide(slide.id, 'up')}
                              className="p-1 bg-gray-700/40 hover:bg-gray-700/60 text-gray-300 rounded transition"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          )}
                          {index < editingOffer.slides.length - 1 && (
                            <button
                              onClick={() => handleMoveSlide(slide.id, 'down')}
                              className="p-1 bg-gray-700/40 hover:bg-gray-700/60 text-gray-300 rounded transition"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveSlide(slide.id)}
                            className="p-1 bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Image URL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          URL de l'Image
                        </label>
                        <input
                          type="url"
                          value={slide.imageUrl}
                          onChange={(e) =>
                            handleUpdateSlide(slide.id, {
                              imageUrl: e.target.value,
                            })
                          }
                          placeholder="https://..."
                          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                        />
                        {slide.imageUrl && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-[#333]">
                            <img
                              src={slide.imageUrl}
                              alt="Preview"
                              className="w-full h-48 object-cover"
                              onError={() => {}}
                            />
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Titre
                        </label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) =>
                            handleUpdateSlide(slide.id, { title: e.target.value })
                          }
                          placeholder="ex. Promotion Spéciale"
                          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Subtitle */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Sous-titre
                        </label>
                        <textarea
                          value={slide.subtitle}
                          onChange={(e) =>
                            handleUpdateSlide(slide.id, {
                              subtitle: e.target.value,
                            })
                          }
                          placeholder="ex. Jusqu'à 50% de réduction"
                          rows="2"
                          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* CTA Text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Texte du Bouton CTA
                        </label>
                        <input
                          type="text"
                          value={slide.ctaText}
                          onChange={(e) =>
                            handleUpdateSlide(slide.id, {
                              ctaText: e.target.value,
                            })
                          }
                          placeholder="Commander Maintenant"
                          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Preview */}
                      <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#333]">
                        <p className="text-xs text-gray-500 mb-2">Aperçu</p>
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded overflow-hidden">
                          {slide.imageUrl && (
                            <div className="relative h-32 overflow-hidden">
                              <img
                                src={slide.imageUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={() => {}}
                              />
                              <div className="absolute inset-0 bg-black/40" />
                            </div>
                          )}
                          <div className="p-3">
                            {slide.title && (
                              <h3 className="font-bold text-white text-sm">
                                {slide.title}
                              </h3>
                            )}
                            {slide.subtitle && (
                              <p className="text-xs text-gray-300 mt-1">
                                {slide.subtitle}
                              </p>
                            )}
                            {slide.ctaText && (
                              <button className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium py-2 rounded transition">
                                {slide.ctaText}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleAddSlide}
                    className="w-full px-4 py-3 bg-[#242424] border-2 border-dashed border-[#444] hover:border-orange-500 text-orange-400 font-medium rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Ajouter une Diapositive
                  </button>
                </div>
              )}

              {/* Deals Tab */}
              {activeTab === 'deals' && (
                <div className="space-y-6">
                  {/* Discount Percent */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Pourcentage de Réduction
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="90"
                        value={editingOffer.discountPercent}
                        onChange={(e) =>
                          updateEditingOffer({
                            discountPercent: parseInt(e.target.value),
                          })
                        }
                        className="flex-1 h-2 bg-[#333] rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                      <div className="bg-orange-500/20 px-4 py-2 rounded-lg text-orange-400 font-bold text-lg min-w-16 text-center">
                        {editingOffer.discountPercent}%
                      </div>
                    </div>
                  </div>

                  {/* Affects All Menu */}
                  <div className="flex items-center gap-3 p-3 bg-[#242424] rounded-lg border border-[#333]">
                    <input
                      type="checkbox"
                      id="affectsAllMenu"
                      checked={editingOffer.affectsAllMenu}
                      onChange={(e) =>
                        updateEditingOffer({
                          affectsAllMenu: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded accent-orange-500"
                    />
                    <label
                      htmlFor="affectsAllMenu"
                      className="text-gray-300 font-medium cursor-pointer flex-1"
                    >
                      Appliquer la réduction à tous les articles du menu
                    </label>
                  </div>

                  {/* Special Deals */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Offres Spéciales / Bundles
                    </h3>

                    {editingOffer.deals.length === 0 ? (
                      <p className="text-gray-400 text-sm mb-4">
                        Aucune offre spéciale. Ajoutez des bundles ou des articles promotionnels.
                      </p>
                    ) : (
                      <div className="space-y-4 mb-4">
                        {editingOffer.deals.map((deal) => (
                          <div
                            key={deal.id}
                            className="bg-[#242424] border border-[#333] rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-white">
                                {deal.name || '(Sans titre)'}
                              </h4>
                              <button
                                onClick={() => handleRemoveDeal(deal.id)}
                                className="p-1 bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Deal Name */}
                            <input
                              type="text"
                              value={deal.name}
                              onChange={(e) =>
                                handleUpdateDeal(deal.id, { name: e.target.value })
                              }
                              placeholder="ex. Combo Sushi Premium"
                              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 text-sm"
                            />

                            {/* Deal Description */}
                            <textarea
                              value={deal.description}
                              onChange={(e) =>
                                handleUpdateDeal(deal.id, {
                                  description: e.target.value,
                                })
                              }
                              placeholder="Description de l'offre"
                              rows="2"
                              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 text-sm"
                            />

                            {/* Prices */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                  Prix Original
                                </label>
                                <input
                                  type="number"
                                  value={deal.originalPrice}
                                  onChange={(e) =>
                                    handleUpdateDeal(deal.id, {
                                      originalPrice: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  placeholder="0"
                                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                  Prix Promo
                                </label>
                                <input
                                  type="number"
                                  value={deal.discountedPrice}
                                  onChange={(e) =>
                                    handleUpdateDeal(deal.id, {
                                      discountedPrice: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  placeholder="0"
                                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 text-sm"
                                />
                              </div>
                            </div>

                            {/* Price Preview */}
                            {deal.originalPrice > 0 && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400 line-through">
                                  {deal.originalPrice.toFixed(2)} MAD
                                </span>
                                <span className="text-orange-400 font-bold">
                                  {deal.discountedPrice.toFixed(2)} MAD
                                </span>
                                {deal.originalPrice > deal.discountedPrice && (
                                  <span className="text-green-400 text-xs">
                                    Économie: {(deal.originalPrice - deal.discountedPrice).toFixed(2)} MAD
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={handleAddDeal}
                      className="w-full px-4 py-3 bg-[#242424] border-2 border-dashed border-[#444] hover:border-orange-500 text-orange-400 font-medium rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Ajouter une Offre Spéciale
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-[#242424] border-t border-[#333] p-4 flex gap-3 justify-end">
              <button
                onClick={handleCancelEdit}
                className="px-6 py-2 bg-gray-700/40 hover:bg-gray-700/60 text-gray-300 rounded-lg font-medium transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveOffer}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersModule;
