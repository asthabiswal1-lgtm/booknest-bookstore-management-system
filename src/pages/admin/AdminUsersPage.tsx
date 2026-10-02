import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AccountStatus, MembershipTier, User, UserRole } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, updateUser, deleteUser, addUser } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'readers' | 'curators' | 'vip' | 'suspended'>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(['usr-8902', 'usr-8841', 'usr-7729']);
  const [targetUser, setTargetUser] = useState<User>(users[0]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(targetUser?.name || '');
  const [editEmail, setEditEmail] = useState(targetUser?.email || '');
  const [editRole, setEditRole] = useState<UserRole>(targetUser?.role || 'customer');
  const [editTier, setEditTier] = useState<MembershipTier>(targetUser?.membershipTier || "Curator's Circle VIP");
  const [editStatus, setEditStatus] = useState<AccountStatus>(targetUser?.status || 'active');
  const [subWeekly, setSubWeekly] = useState(targetUser?.subscriptions?.weeklyLetters ?? true);
  const [subSms, setSubSms] = useState(targetUser?.subscriptions?.smsAlerts ?? true);
  const [subAuction, setSubAuction] = useState(targetUser?.subscriptions?.auctionNotifications ?? false);

  // Invite Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('curator');

  const handleSelectTargetUser = (user: User) => {
    setTargetUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditTier(user.membershipTier);
    setEditStatus(user.status);
    setSubWeekly(user.subscriptions?.weeklyLetters ?? true);
    setSubSms(user.subscriptions?.smsAlerts ?? false);
    setSubAuction(user.subscriptions?.auctionNotifications ?? false);

    const formEl = document.getElementById('edit-user-drawer-card');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSaveUserUpdates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;

    updateUser(targetUser.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      role: editRole,
      membershipTier: editTier,
      status: editStatus,
      subscriptions: {
        weeklyLetters: subWeekly,
        smsAlerts: subSms,
        auctionNotifications: subAuction,
      },
    });

    showToast(`User updates saved for ${editName} (${targetUser.userCode})`, 'success');
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.includes('@')) {
      showToast('Please provide a valid email for curator invitation', 'warning');
      return;
    }

    addUser({
      name: inviteName.trim() || 'Invited Curator',
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      roleTitle: inviteRole === 'admin' ? 'Store Administrator' : 'Staff Curator',
      membershipTier: "Curator's Circle VIP",
      status: 'pending',
      city: 'New York',
      state: 'NY',
      shippingAddress: '1 BookNest Way, NY',
      subscriptions: {
        weeklyLetters: true,
        smsAlerts: true,
        auctionNotifications: false,
      },
    });

    setInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    showToast(`Curator invitation dispatched to ${inviteEmail}`, 'success', 'mail');
  };

  // Filtered roster
  const filteredUsers = users.filter((u) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.userCode.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (segmentFilter === 'readers') return u.role === 'customer';
    if (segmentFilter === 'curators') return u.role === 'curator' || u.role === 'admin';
    if (segmentFilter === 'vip') return u.membershipTier.includes('VIP');
    if (segmentFilter === 'suspended') return u.status === 'suspended';

    return true;
  });

  const vipCount = users.filter((u) => u.membershipTier.includes('VIP')).length;
  const staffCount = users.filter((u) => u.role === 'curator' || u.role === 'admin').length;

  return (
    <div className="flex flex-col w-full pb-20 max-w-4xl mx-auto px-3 sm:px-6">
      {/* 1. Header Bar with Back Button */}
      <div className="py-2.5 flex items-center justify-between border-b border-[#dfe2ec]/60 mb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="w-10 h-10 -ml-1 flex items-center justify-center text-[#57423b] hover:text-[#9f3c16] rounded-lg transition-colors"
            aria-label="Back to Dashboard"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <span className="font-title-md text-sm sm:text-base text-[#181c23] leading-tight font-semibold">
              Reader & User Directory
            </span>
            <span className="font-label-sm text-[10px] text-[#8a726a] uppercase tracking-wider leading-none">
              Community & Access
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              showToast('Exporting 4,120 user records to CSV...', 'info', 'file_download');
              setTimeout(() => {
                showToast('User directory CSV downloaded successfully', 'success', 'description');
              }, 1000);
            }}
            className="h-8 px-2.5 rounded-lg bg-white text-[#181c23] hover:bg-[#ebeef7] border border-[#dfe2ec] font-label-md text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[15px] text-[#9f3c16]">file_download</span>
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="h-8 px-3 rounded-lg bg-[#9f3c16] hover:bg-[#bf542c] text-white font-label-md text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">person_add</span>
            <span>+ Invite</span>
          </button>
        </div>
      </div>

      {/* 2. Sync State Notification Strip */}
      <div className="mb-3">
        <div className="bg-[#f1f3fd] rounded-xl p-2.5 flex items-center justify-between shadow-xs border border-[#dfe2ec]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#904d00] animate-pulse"></span>
            <span className="font-label-sm text-[10px] text-[#8a726a] uppercase tracking-wider font-bold">
              Sync State
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-body-sm text-xs text-[#57423b]">
            <span className="material-symbols-outlined text-[16px] text-[#9f3c16]">cloud_done</span>
            <span>users (4,120 records) • 2m ago</span>
          </div>
        </div>
      </div>

      {/* 3. Visual Metrics Carousel (Horizontal Scroll Rail) */}
      <section className="mb-3 overflow-x-auto no-scrollbar py-1">
        <div className="flex gap-2.5">
          {/* Total Readers */}
          <div className="shrink-0 w-44 bg-white rounded-xl p-3 shadow-xs border border-[#dfe2ec] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] text-[#8a726a] uppercase tracking-wider font-bold">
                Total Readers
              </span>
              <span className="w-7 h-7 rounded-lg bg-[#f1f3fd] flex items-center justify-center text-[#9f3c16]">
                <span className="material-symbols-outlined text-[16px]">group</span>
              </span>
            </div>
            <div className="mt-2">
              <div className="font-headline-sm text-lg font-bold text-[#181c23] tracking-tight">4,120</div>
              <div className="flex items-center gap-1 mt-0.5 text-[#904d00]">
                <span className="material-symbols-outlined text-[13px]">trending_up</span>
                <span className="font-label-sm text-[10px] font-semibold">+215 this month</span>
              </div>
            </div>
          </div>

          {/* VIP Circle */}
          <div className="shrink-0 w-44 bg-[#ffdcc3]/40 rounded-xl p-3 shadow-xs border border-[#dec0b7] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] text-[#2f1500] uppercase tracking-wider font-bold">
                VIP Circle
              </span>
              <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#904d00]">
                <span className="material-symbols-outlined text-[16px]">auto_stories</span>
              </span>
            </div>
            <div className="mt-2">
              <div className="font-headline-sm text-lg font-bold text-[#2f1500] tracking-tight">684</div>
              <span className="font-label-sm text-[10px] text-[#6e3900]">Curator's Circle Tier</span>
            </div>
          </div>

          {/* Curators & Staff */}
          <div className="shrink-0 w-44 bg-[#ffdbcf]/40 rounded-xl p-3 shadow-xs border border-[#dec0b7] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] text-[#390c00] uppercase tracking-wider font-bold">
                Curators
              </span>
              <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#9f3c16]">
                <span className="material-symbols-outlined text-[16px]">badge</span>
              </span>
            </div>
            <div className="mt-2">
              <div className="font-headline-sm text-lg font-bold text-[#390c00] tracking-tight">
                {staffCount * 3}
              </div>
              <span className="font-label-sm text-[10px] text-[#822801]">Store Admins & Staff</span>
            </div>
          </div>

          {/* Audit / Hold */}
          <div className="shrink-0 w-44 bg-[#ffdad6]/40 rounded-xl p-3 shadow-xs border border-[#ba1a1a]/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] text-[#ba1a1a] uppercase tracking-wider font-bold">
                Audit / Hold
              </span>
              <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#ba1a1a]">
                <span className="material-symbols-outlined text-[16px]">shield_with_heart</span>
              </span>
            </div>
            <div className="mt-2">
              <div className="font-headline-sm text-lg font-bold text-[#93000a] tracking-tight">3</div>
              <span className="font-label-sm text-[10px] text-[#93000a]">Payment flags pending</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Search & Segment Filter Chips */}
      <section className="space-y-2 mb-3">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8a726a] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search reader by name, email, or USR-..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-white text-[#181c23] font-body-sm text-xs placeholder:text-[#8a726a] focus:outline-none focus:ring-1 focus:ring-[#9f3c16] border border-[#dfe2ec] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSegmentFilter('all')}
            className={`px-3 py-1.5 rounded-full font-label-md text-xs transition-all whitespace-nowrap ${
              segmentFilter === 'all'
                ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
            }`}
          >
            All (4,120)
          </button>

          <button
            type="button"
            onClick={() => setSegmentFilter('readers')}
            className={`px-3 py-1.5 rounded-full font-label-md text-xs transition-all whitespace-nowrap ${
              segmentFilter === 'readers'
                ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
            }`}
          >
            Readers (4,108)
          </button>

          <button
            type="button"
            onClick={() => setSegmentFilter('curators')}
            className={`px-3 py-1.5 rounded-full font-label-md text-xs transition-all whitespace-nowrap ${
              segmentFilter === 'curators'
                ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
            }`}
          >
            Curators & Staff ({staffCount * 3})
          </button>

          <button
            type="button"
            onClick={() => setSegmentFilter('vip')}
            className={`px-3 py-1.5 rounded-full font-label-md text-xs transition-all whitespace-nowrap ${
              segmentFilter === 'vip'
                ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
            }`}
          >
            VIP Circle (684)
          </button>

          <button
            type="button"
            onClick={() => setSegmentFilter('suspended')}
            className={`px-3 py-1.5 rounded-full font-label-md text-xs transition-all whitespace-nowrap ${
              segmentFilter === 'suspended'
                ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
            }`}
          >
            Suspended (5)
          </button>
        </div>
      </section>

      {/* 5. Sticky Batch Action Toolbar */}
      <section className="bg-[#e5e8f2] rounded-xl px-3 py-2 flex items-center justify-between shadow-xs border border-[#dfe2ec] mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedUserIds.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedUserIds(users.map((u) => u.id));
              } else {
                setSelectedUserIds([]);
              }
            }}
            className="w-4 h-4 rounded text-[#9f3c16] accent-[#9f3c16] cursor-pointer"
          />
          <span className="font-label-md text-xs font-semibold text-[#181c23]">
            {selectedUserIds.length} users selected
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => showToast('Membership tier batch upgrade modal open', 'info', 'loyalty')}
            className="h-7 px-2 bg-white text-[#9f3c16] hover:bg-[#f1f3fd] rounded-lg font-label-sm text-xs flex items-center gap-1 shadow-xs border border-[#dfe2ec] font-semibold"
          >
            <span className="material-symbols-outlined text-[14px]">loyalty</span>
            <span>Change Tier</span>
          </button>
          <button
            type="button"
            onClick={() => showToast('Exporting selected user records...', 'info', 'file_download')}
            className="h-7 px-2 bg-white text-[#181c23] hover:bg-[#f1f3fd] rounded-lg font-label-sm text-xs flex items-center gap-1 shadow-xs border border-[#dfe2ec] font-semibold"
          >
            <span className="material-symbols-outlined text-[14px]">ios_share</span>
            <span>Export</span>
          </button>
        </div>
      </section>

      {/* 6. User Entity Cards Roster */}
      <section className="space-y-3 mb-6">
        {filteredUsers.map((user) => {
          const isSelected = selectedUserIds.includes(user.id);
          const isTarget = targetUser?.id === user.id;

          return (
            <article
              key={user.id}
              className={`bg-white rounded-xl p-4 shadow-xs border transition-all relative overflow-hidden ${
                isTarget ? 'border-[#9f3c16] ring-1 ring-[#9f3c16]/30' : 'border-[#dfe2ec]'
              }`}
            >
              {isTarget && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#9f3c16]" />}

              {/* Top Row: Avatar & Identifiers */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-[#ffdcc3] flex items-center justify-center font-headline-sm text-sm text-[#2f1500] shadow-xs">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          user.status === 'active' ? 'bg-[#fe932c]' : 'bg-[#ba1a1a]'
                        }`}
                      />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="font-title-md text-sm sm:text-base text-[#181c23] font-semibold truncate leading-tight">
                        {user.name}
                      </h2>
                      <span className="material-symbols-outlined text-[15px] text-[#9f3c16]">
                        {user.role === 'admin' ? 'admin_panel_settings' : 'verified'}
                      </span>
                    </div>
                    <p className="font-body-sm text-[11px] text-[#57423b] truncate">
                      {user.city}, {user.state} • <span className="font-semibold text-[#181c23]">{user.userCode}</span>
                    </p>
                    <p className="font-body-sm text-[10px] text-[#8a726a] truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {user.role === 'curator' && (
                    <span className="bg-[#ffdbcf] text-[#822801] font-label-sm text-[10px] uppercase font-bold px-2 py-0.2 rounded-full">
                      Staff
                    </span>
                  )}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUserIds((prev) => [...prev, user.id]);
                      } else {
                        setSelectedUserIds((prev) => prev.filter((id) => id !== user.id));
                      }
                    }}
                    className="w-4 h-4 rounded text-[#9f3c16] accent-[#9f3c16] cursor-pointer"
                  />
                </div>
              </div>

              {/* Badges Row */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                <span className="bg-[#ffdcc3]/60 text-[#2f1500] px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">stars</span>
                  <span>{user.membershipTier}</span>
                </span>
                <span className="bg-[#ebeef7] text-[#57423b] px-2 py-0.5 rounded-full font-label-sm text-[10px]">
                  {user.roleTitle || user.role}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] font-semibold ${
                    user.status === 'active'
                      ? 'bg-[#dcfce7] text-[#15803d]'
                      : 'bg-[#ffdad6] text-[#93000a]'
                  }`}
                >
                  {user.status === 'active' ? 'Active Status' : 'Suspended'}
                </span>
              </div>

              {/* Lifetime Stats Bento Strip */}
              <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-lg bg-[#f1f3fd] text-center">
                <div>
                  <span className="block font-label-sm text-[10px] text-[#8a726a] uppercase">Purchases</span>
                  <span className="font-title-md text-xs sm:text-sm text-[#181c23] font-bold">
                    {user.ordersCount} Orders
                  </span>
                </div>
                <div>
                  <span className="block font-label-sm text-[10px] text-[#8a726a] uppercase">Total Value</span>
                  <span className="font-title-md text-xs sm:text-sm text-[#9f3c16] font-bold">
                    ${user.totalSpent.toFixed(0)}
                  </span>
                </div>
                <div>
                  <span className="block font-label-sm text-[10px] text-[#8a726a] uppercase">Library</span>
                  <span className="font-title-md text-xs sm:text-sm text-[#181c23] font-bold">
                    {user.libraryCount} Books
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-1 border-t border-[#dfe2ec]/50">
                <button
                  type="button"
                  onClick={() => navigate('/admin/orders')}
                  className="h-9 rounded-lg bg-[#ebeef7] hover:bg-[#dfe2ec] text-[#181c23] font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                  <span>View Orders</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTargetUser(user)}
                  className="h-9 rounded-lg bg-[#9f3c16] hover:bg-[#bf542c] text-white font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Manage Account</span>
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* 7. Interactive Edit Reader Profile & Permissions Card */}
      <section
        id="edit-user-drawer-card"
        className="bg-white rounded-2xl p-5 shadow-md border border-[#dec0b7]/50 space-y-3 mb-6"
      >
        <div className="flex items-start justify-between pb-2 border-b border-[#dfe2ec]">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px] text-[#9f3c16]">tune</span>
              <h3 className="font-title-lg text-sm sm:text-base text-[#181c23] font-semibold">
                Edit Reader Profile & Permissions
              </h3>
            </div>
            <p className="font-body-sm text-[11px] text-[#57423b] mt-0.5">
              Target Record: <strong className="text-[#181c23]">{targetUser.name} ({targetUser.userCode})</strong>
            </p>
            <span className="inline-block mt-1 font-mono text-[10px] text-[#8a726a] bg-[#ebeef7] px-1.5 py-0.2 rounded">
              _id: 65e3ab9f82d1c01e29
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveUserUpdates} className="space-y-3 pt-1">
          <div>
            <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full h-10 px-3 bg-[#f1f3fd] text-xs text-[#181c23] rounded-lg border border-[#dfe2ec] focus:outline-none focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">Email Address</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full h-10 px-3 bg-[#f1f3fd] text-xs text-[#181c23] rounded-lg border border-[#dfe2ec] focus:outline-none focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">
              System Role Assignment
            </label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as UserRole)}
              className="w-full h-10 px-3 bg-[#f1f3fd] text-xs text-[#181c23] rounded-lg border border-[#dfe2ec] focus:outline-none focus:bg-white"
            >
              <option value="customer">Customer (Reader)</option>
              <option value="curator">Staff Curator</option>
              <option value="admin">Store Admin</option>
            </select>
          </div>

          <div>
            <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">
              BookNest Membership Tier
            </label>
            <select
              value={editTier}
              onChange={(e) => setEditTier(e.target.value as MembershipTier)}
              className="w-full h-10 px-3 bg-[#f1f3fd] text-xs text-[#181c23] rounded-lg border border-[#dfe2ec] focus:outline-none focus:bg-white"
            >
              <option value="Standard Reader">Standard Reader</option>
              <option value="Book Club Member">Book Club Member</option>
              <option value="Curator's Circle VIP">Curator's Circle VIP</option>
              <option value="Archive Fellow">Archive Fellow</option>
              <option value="Poetry Fellowship Tier">Poetry Fellowship Tier</option>
              <option value="First Edition Collector">First Edition Collector</option>
            </select>
          </div>

          {/* Account Status Radio Pills */}
          <div>
            <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1.5">
              Account Status
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['active', 'suspended', 'pending'] as AccountStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setEditStatus(st)}
                  className={`h-9 px-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                    editStatus === st
                      ? st === 'active'
                        ? 'bg-[#ffdcc3] text-[#2f1500] font-bold'
                        : st === 'suspended'
                        ? 'bg-[#ffdad6] text-[#93000a] font-bold'
                        : 'bg-[#ebeef7] text-[#181c23] font-bold'
                      : 'bg-[#f1f3fd] text-[#57423b] hover:bg-[#ebeef7]'
                  }`}
                >
                  {st === 'pending' ? 'Verification' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Subscriptions */}
          <div className="pt-1 space-y-2">
            <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">
              Curator Dispatch Subscriptions
            </label>
            <label className="flex items-center gap-2 text-xs text-[#181c23] cursor-pointer">
              <input
                type="checkbox"
                checked={subWeekly}
                onChange={(e) => setSubWeekly(e.target.checked)}
                className="w-4 h-4 accent-[#9f3c16] rounded"
              />
              <span>Weekly Curator Letters & Literary Reviews</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-[#181c23] cursor-pointer">
              <input
                type="checkbox"
                checked={subSms}
                onChange={(e) => setSubSms(e.target.checked)}
                className="w-4 h-4 accent-[#9f3c16] rounded"
              />
              <span>Order & Shipment Tracking SMS Alerts</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-[#181c23] cursor-pointer">
              <input
                type="checkbox"
                checked={subAuction}
                onChange={(e) => setSubAuction(e.target.checked)}
                className="w-4 h-4 accent-[#9f3c16] rounded"
              />
              <span>Rare Book Auction Early Notification Rail</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-2 border-t border-[#dfe2ec] space-y-2">
            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-[#9f3c16] hover:bg-[#bf542c] text-white font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">save</span>
              <span>Save User Updates</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => showToast('Password reset token dispatched to reader email', 'info')}
                className="h-9 rounded-lg bg-[#ebeef7] hover:bg-[#dfe2ec] text-[#181c23] font-label-md text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                <span>Reset Password</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditStatus('suspended');
                  showToast(`Account for ${targetUser.name} suspended`, 'warning');
                }}
                className="h-9 rounded-lg bg-[#ffdad6] hover:bg-[#ffdad6]/80 text-[#ba1a1a] font-label-md text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">person_off</span>
                <span>Deactivate</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 8. Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#181c23]/60 backdrop-blur-sm" onClick={() => setInviteModalOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl z-10 border border-[#dec0b7]/40 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#dfe2ec]">
              <h3 className="font-headline-sm text-base text-[#181c23]">Invite Curator or Reader</h3>
              <button onClick={() => setInviteModalOpen(false)} className="text-[#8a726a] hover:text-[#181c23] p-1">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3 py-3">
              <div>
                <label className="font-label-sm text-[10px] text-[#57423b] uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Penelope Fitzgerald"
                  className="w-full h-10 px-3 bg-[#f1f3fd] rounded-lg text-xs text-[#181c23] border border-[#dfe2ec] focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-label-sm text-[10px] text-[#57423b] uppercase block mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="penelope@curation.booknest.press"
                  className="w-full h-10 px-3 bg-[#f1f3fd] rounded-lg text-xs text-[#181c23] border border-[#dfe2ec] focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-label-sm text-[10px] text-[#57423b] uppercase block mb-1">System Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full h-10 px-3 bg-[#f1f3fd] rounded-lg text-xs text-[#181c23] border border-[#dfe2ec] focus:outline-none focus:bg-white"
                >
                  <option value="curator">Staff Curator</option>
                  <option value="customer">Customer (Reader)</option>
                  <option value="admin">Store Admin</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#ebeef7] text-[#181c23] rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-2.5 bg-[#9f3c16] text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Telemetry Footer */}
      <footer className="pt-2 pb-4 space-y-2 text-center text-xs text-[#57423b]">
        <div className="flex items-center justify-center gap-1.5 text-[11px]">
          <span className="material-symbols-outlined text-[14px]">database</span>
          <span>MongoDB 'users' • Node.js REST API v2.4 • TLS 1.3</span>
        </div>
      </footer>
    </div>
  );
};
