const form = document.getElementById('schedule-form');
const feedback = document.getElementById('form-feedback');
const scheduleRepeatTypeInput = document.getElementById('scheduleRepeatType');
const scheduleAtInput = document.getElementById('scheduleAt');
const scheduleRepeatDaysField = document.getElementById('scheduleRepeatDaysField');
const scheduleRepeatDaysPicker = document.getElementById('scheduleRepeatDaysPicker');
const scheduleRepeatDaysTrigger = document.getElementById('scheduleRepeatDaysTrigger');
const scheduleRepeatDaysTriggerLabel = document.getElementById('scheduleRepeatDaysTriggerLabel');
const scheduleRepeatDaysPopover = document.getElementById('scheduleRepeatDaysPopover');
const scheduleRepeatDaysDoneBtn = document.getElementById('scheduleRepeatDaysDoneBtn');
const scheduleSendTimeField = document.getElementById('scheduleSendTimeField');
const scheduleMediaTypeField = document.getElementById('scheduleMediaTypeField');
const scheduleMediaTypeInput = document.getElementById('scheduleMediaType');
const scheduleMediaFields = document.getElementById('schedule-media-fields');
const scheduleMediaSourceInput = document.getElementById('scheduleMediaSource');
const scheduleMediaSourceField = document.getElementById('scheduleMediaSourceField');
const scheduleMediaSourceTabs = Array.from(document.querySelectorAll('[data-schedule-media-source]'));
const scheduleMediaUrlField = document.getElementById('scheduleMediaUrlField');
const scheduleMediaUrlInput = document.getElementById('scheduleMediaUrl');
const scheduleMediaUploadField = document.getElementById('scheduleMediaUploadField');
const scheduleMediaUploadInput = document.getElementById('scheduleMediaUpload');
const scheduleFileNameField = document.getElementById('scheduleFileNameField');
const scheduleFileNameInput = document.getElementById('scheduleFileName');
const scheduleAddButtonRowBtn = document.getElementById('scheduleAddButtonRowBtn');
const scheduleButtonRows = document.getElementById('scheduleButtonRows');
const scheduleTargetStep = document.getElementById('scheduleTargetStep');
const targetTypeInput = document.getElementById('targetType');
const targetValueField = document.getElementById('targetValueField');
const targetValueLabel = document.getElementById('targetValueLabel');
const targetHint = document.getElementById('targetHint');
const targetValueInput = document.getElementById('targetValue');
const targetValueGroupSuggestions = document.getElementById('targetValueGroupSuggestions');
const targetValuePersonalSuggestions = document.getElementById('targetValuePersonalSuggestions');
const scheduleRefreshBtn = document.getElementById('scheduleRefreshBtn');
const scheduleSelectChatBtn = document.getElementById('scheduleSelectChatBtn');
const waStatus = document.getElementById('wa-status');
const waConnectedWrap = document.getElementById('wa-connected-wrap');
const waConnectedDetails = document.getElementById('waConnectedDetails');
const waConnectedName = document.getElementById('waConnectedName');
const waConnectedPhone = document.getElementById('waConnectedPhone');
const waConnectedJid = document.getElementById('waConnectedJid');
const waQrWrap = document.getElementById('wa-qr-wrap');
const waQrEmpty = document.getElementById('wa-qr-empty');
const waQrCaption = document.getElementById('wa-qr-caption');
const waQrImage = waQrWrap ? waQrWrap.querySelector('img.qr') : null;
const waQrInstructions = document.getElementById('wa-qr-instructions');
const waQrConnectedBanner = document.getElementById('wa-qr-connected-banner');
const waQrActions = document.getElementById('wa-qr-actions'); // may be null in new UI
const waQrFrameWrap = document.getElementById('waQrFrameWrap');
const refreshQrBtn = document.getElementById('refreshQrBtn');
const waQrMeta = document.getElementById('waQrMeta');
const waQrCountdown = document.getElementById('waQrCountdown');
const linkedDevicesConnectionState = document.getElementById('linkedDevicesConnectionState');
const methodTabQr = document.getElementById('methodTabQr');
const methodTabPhone = document.getElementById('methodTabPhone');
const qrMethodPanel = document.getElementById('qr-method');
const phoneMethodPanel = document.getElementById('phone-method');
const scheduleTabCreate = document.getElementById('scheduleTabCreate');
const scheduleTabList = document.getElementById('scheduleTabList');
const scheduleSectionDropdown = document.getElementById('scheduleSectionDropdown');
const scheduleSectionDropdownTrigger = document.getElementById('scheduleSectionDropdownTrigger');
const scheduleSectionDropdownLabel = document.getElementById('scheduleSectionDropdownLabel');
const scheduleSectionNav = document.getElementById('scheduleSectionNav');
const scheduleCreatePanel = document.getElementById('schedule-create-panel');
const scheduleListPanel = document.getElementById('schedule-list-panel');
const shareScheduleLinkBtn = document.getElementById('shareScheduleLinkBtn');
const shareScheduleLinkFeedback = document.getElementById('shareScheduleLinkFeedback');
const sendForm = document.getElementById('send-form');
const sendFeedback = document.getElementById('send-feedback');
const sendTargetTypeInput = document.getElementById('sendTargetType');
const sendTargetValueField = document.getElementById('sendTargetValueField');
const sendTargetValueLabel = document.getElementById('sendTargetValueLabel');
const sendTargetHint = document.getElementById('sendTargetHint');
const sendTargetValueInput = document.getElementById('sendTargetValue');
const sendMediaTypeField = document.getElementById('sendMediaTypeField');
const sendMediaTypeInput = document.getElementById('sendMediaType');
const sendMediaFields = document.getElementById('send-media-fields');
const sendMediaSourceInput = document.getElementById('sendMediaSource');
const sendMediaSourceField = document.getElementById('sendMediaSourceField');
const sendMediaSourceTabs = Array.from(document.querySelectorAll('[data-send-media-source]'));
const sendMediaUrlField = document.getElementById('sendMediaUrlField');
const sendMediaUrlInput = document.getElementById('sendMediaUrl');
const sendMediaUploadField = document.getElementById('sendMediaUploadField');
const sendMediaUploadInput = document.getElementById('sendMediaUpload');
const sendFileNameField = document.getElementById('sendFileNameField');
const sendFileNameInput = document.getElementById('sendFileName');
const sendAddButtonRowBtn = document.getElementById('sendAddButtonRowBtn');
const sendButtonRows = document.getElementById('sendButtonRows');
const sendTargetValueGroupSuggestions = document.getElementById('sendTargetValueGroupSuggestions');
const sendTargetValuePersonalSuggestions = document.getElementById('sendTargetValuePersonalSuggestions');
const sendRefreshBtn = document.getElementById('sendRefreshBtn');
const sendSelectChatBtn = document.getElementById('sendSelectChatBtn');
const sendTargetClearBtn = document.getElementById('sendTargetClearBtn');
const commandTabCreate = document.getElementById('commandTabCreate');
const commandTabList = document.getElementById('commandTabList');
const commandCreatePanel = document.getElementById('command-create-panel');
const commandListPanel = document.getElementById('command-list-panel');
const commandSectionDropdown = document.getElementById('commandSectionDropdown');
const commandSectionDropdownTrigger = document.getElementById('commandSectionDropdownTrigger');
const commandSectionDropdownLabel = document.getElementById('commandSectionDropdownLabel');
const commandSectionNav = document.getElementById('commandSectionNav');
const pairingPhoneInput = document.getElementById('pairingPhone');
const requestPairingBtn = document.getElementById('requestPairingBtn');
const pairingFeedback = document.getElementById('pairing-feedback');
const pairingCodeWrap = document.getElementById('pairing-code-wrap');
const pairingCodeValue = document.getElementById('pairing-code-value');
const chatSelectorModal = document.getElementById('chatSelectorModal');
const closeChatSelectorModal = document.getElementById('closeChatSelectorModal');
const chatSelectorList = document.getElementById('chatSelectorList');
const chatSelectorFeedback = document.getElementById('chatSelectorFeedback');
const chatSelectorModalTitle = document.getElementById('chatSelectorModalTitle');
const chatSelectorModalDesc = document.getElementById('chatSelectorModalDesc');
const accountTargetTips = document.getElementById('account-target-tips');
const accountSettingsTabs = Array.from(document.querySelectorAll('.account-settings-tab[data-account-tab]'));
const accountSettingsPanels = Array.from(document.querySelectorAll('.account-settings-panel[data-account-panel]'));
const accountSettingsDropdownTrigger = document.getElementById('accountSettingsDropdownTrigger');
const accountSettingsDropdownLabel = document.getElementById('accountSettingsDropdownLabel');
const accountSettingsNav = document.getElementById('accountSettingsNav');
const accountSettingsHeaderDropdown = document.getElementById('accountSettingsHeaderDropdown');
const accountProfileForm = document.getElementById('accountProfileForm');
const accountProfileNameInput = document.getElementById('accountProfileName');
const accountProfileAboutInput = document.getElementById('accountProfileAbout');
const accountProfileEmailInput = document.getElementById('accountProfileEmail');
const accountProfileFeedback = document.getElementById('accountProfileFeedback');
const accountProfileDisplayName = document.getElementById('accountProfileDisplayName');
const accountProfileDisplayStatus = document.getElementById('accountProfileDisplayStatus');
const accountProfilePreviewName = document.getElementById('accountProfilePreviewName');
const accountProfilePreviewAbout = document.getElementById('accountProfilePreviewAbout');
const accountProfilePreviewEmail = document.getElementById('accountProfilePreviewEmail');
const accountProfileAvatarImage = document.getElementById('accountProfileAvatarImage');
const accountProfileAvatarFallback = document.getElementById('accountProfileAvatarFallback');
const timezoneSettingSelect = document.getElementById('timezoneSettingSelect');
const timezoneSettingFeedback = document.getElementById('timezoneSettingFeedback');
const ownerNumberInput = document.getElementById('ownerNumberInput');
const ownerNumberSaveBtn = document.getElementById('ownerNumberSaveBtn');
const ownerNumberFeedback = document.getElementById('ownerNumberFeedback');
const ownerNumberDisplay = document.getElementById('ownerNumberDisplay');
const commandModeSelect = document.getElementById('commandModeSelect');
const commandModeDisplay = document.getElementById('commandModeDisplay');
const toggleBotResponsePersonal = document.getElementById('toggleBotResponsePersonal');
const toggleBotResponseGroup = document.getElementById('toggleBotResponseGroup');
const toggleBotResponseSelfCommand = document.getElementById('toggleBotResponseSelfCommand');
const toggleBotResponsePersonalLabel = document.getElementById('toggleBotResponsePersonalLabel');
const toggleBotResponseGroupLabel = document.getElementById('toggleBotResponseGroupLabel');
const toggleBotResponseSelfCommandLabel = document.getElementById('toggleBotResponseSelfCommandLabel');

// Group filter elements
const toggleGroupFilterAll = document.getElementById('toggleGroupFilterAll');
const toggleGroupFilterAllLabel = document.getElementById('toggleGroupFilterAllLabel');
const groupWhitelistPanel = document.getElementById('groupWhitelistPanel');
const groupFilterList = document.getElementById('groupFilterList');
const groupFilterEmpty = document.getElementById('groupFilterEmpty');
const refreshGroupListBtn = document.getElementById('refreshGroupListBtn');
const saveGroupFilterBtn = document.getElementById('saveGroupFilterBtn');
const groupFilterFeedback = document.getElementById('groupFilterFeedback');

// Allowed senders elements
const toggleAllowedSendersAnyone = document.getElementById('toggleAllowedSendersAnyone');
const toggleAllowedSendersAnyoneLabel = document.getElementById('toggleAllowedSendersAnyoneLabel');
const allowedSendersPanel = document.getElementById('allowedSendersPanel');
const allowedSenderInput = document.getElementById('allowedSenderInput');
const addAllowedSenderBtn = document.getElementById('addAllowedSenderBtn');
const allowedSendersList = document.getElementById('allowedSendersList');
const allowedSendersFeedback = document.getElementById('allowedSendersFeedback');
const saveAllowedSendersBtn = document.getElementById('saveAllowedSendersBtn');
const botResponseSettingsFeedback = document.getElementById('botResponseSettingsFeedback');
const accountHealthConnection = document.getElementById('accountHealthConnection');
const accountHealthCommandMode = document.getElementById('accountHealthCommandMode');
const accountHealthSelfCommand = document.getElementById('accountHealthSelfCommand');
const accountChatStatePersonal = document.getElementById('accountChatStatePersonal');
const accountChatStateGroup = document.getElementById('accountChatStateGroup');
const accountChatStateSelfCommand = document.getElementById('accountChatStateSelfCommand');
const profileHomeName = document.getElementById('profileHomeName');
const profileHomeSubtitle = document.getElementById('profileHomeSubtitle');
const profileHomeConnectionBadge = document.getElementById('profileHomeConnectionBadge');
const profileHomeSummaryName = document.getElementById('profileHomeSummaryName');
const profileHomeSummaryPhone = document.getElementById('profileHomeSummaryPhone');
const profileHomeSummaryJid = document.getElementById('profileHomeSummaryJid');
const profileHomeSummaryCommandMode = document.getElementById('profileHomeSummaryCommandMode');
const profileHomeSummaryPlatform = document.getElementById('profileHomeSummaryPlatform');
const profileHomeSummaryTimeZone = document.getElementById('profileHomeSummaryTimeZone');
const profileHomeAvatarImage = document.getElementById('profileHomeAvatarImage');
const profileHomeAvatarFallback = document.getElementById('profileHomeAvatarFallback');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarMenuBtn = document.getElementById('sidebarMenuBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const topNavTitle = document.getElementById('topNavTitle');
const breadcrumbRoot = document.getElementById('breadcrumbRoot');
const breadcrumbPage = document.getElementById('breadcrumbPage');
const breadcrumbSectionSep = document.getElementById('breadcrumbSectionSep');
const breadcrumbSection = document.getElementById('breadcrumbSection');
const routeListEditModeBtn = document.getElementById('routeListEditModeBtn');
const routeListSearchInput = document.getElementById('routeListSearchInput');
const routeListMethodFilter = document.getElementById('routeListMethodFilter');
const routeListEditHint = document.getElementById('routeListEditHint');
const routeListTableBody = document.getElementById('routeListTableBody');
const routeListTotalCount = document.getElementById('routeListTotalCount');
const routeListVisibleCount = document.getElementById('routeListVisibleCount');
const routeListPublicCount = document.getElementById('routeListPublicCount');
const routeListEnabledCount = document.getElementById('routeListEnabledCount');
const vendingRouteAddRowBtn = document.getElementById('vendingRouteAddRowBtn');
const vendingRouteFeedback = document.getElementById('vendingRouteFeedback');
const vendingRouteTableBody = document.getElementById('vendingRouteTableBody');
const vendingLocationAddRowBtn = document.getElementById('vendingLocationAddRowBtn');
const vendingLocationFeedback = document.getElementById('vendingLocationFeedback');
const vendingLocationTableBody = document.getElementById('vendingLocationTableBody');
const vendingRouteLocationRouteIdInput = document.getElementById('vendingRouteLocationRouteId');
const vendingRouteLocationLocationIdInput = document.getElementById('vendingRouteLocationLocationId');
const vendingRouteLocationAddRowBtn = document.getElementById('vendingRouteLocationAddRowBtn');
const vendingRouteLocationFeedback = document.getElementById('vendingRouteLocationFeedback');
const vendingRouteLocationTableBody = document.getElementById('vendingRouteLocationTableBody');
const navItems = Array.from(document.querySelectorAll('.sidebar-nav .nav-item, .sidebar-footer .nav-item'));
const pages = Array.from(document.querySelectorAll('.page[data-page]'));
const DEFAULT_PAGE_HASH = '#profile';
const THEME_STORAGE_KEY = 'schedulebot-theme';
const ACCOUNT_PROFILE_STORAGE_KEY = 'schedulebot-account-profile';
const TIMEZONE_STORAGE_KEY = 'schedulebot-timezone';
const DEFAULT_CHAT_RESPONSE_SETTINGS = {
  personalEnabled: false,
  groupEnabled: false,
  selfCommandEnabled: true,
  groupFilterMode: 'all',
  allowedGroupIds: [],
  allowedSendersMode: 'anyone',
  allowedSenderNumbers: [],
};
const DEFAULT_SCHEDULE_USAGE_HELP_TEXT = 'Usage:\n.schedule <time> | <message>\n\nExamples:\n.schedule 10m | Follow up pelanggan\n.schedule 2026-12-31 23:59 | Happy new year!\n\nTime format: 10m, 2h, 1d, atau YYYY-MM-DD HH:mm';
const DEFAULT_SCHEDULE_LIST_EMPTY_TEXT = 'No schedules found for this chat.';
const DEFAULT_SCHEDULE_DELETE_USAGE_TEXT = 'Usage: .scheduledelete <id>\nExample: .scheduledelete 12';
const DEFAULT_VV_USAGE_HELP_TEXT = 'Reply to a "view once" image/video message with .vv to reopen it.';
const DEFAULT_STICKER_USAGE_HELP_TEXT = 'Usage: kirim/reply gambar, video, atau sticker lalu ketik .sticker';
const DEFAULT_ZIP_USAGE_HELP_TEXT = 'Reply mana-mana media/file dengan .zip untuk compress menjadi ZIP.';
const DEFAULT_UNZIP_USAGE_HELP_TEXT = 'Reply fail ZIP dengan .unzip untuk extract kandungan.';
const DEFAULT_PDF2TXT_USAGE_HELP_TEXT = 'Reply fail PDF dengan .pdf2txt untuk extract text.';
const DEFAULT_MAKETXT_USAGE_HELP_TEXT = 'Usage: .maketxt <isi teks>\nContoh: .maketxt Ini nota penting saya';
const DEFAULT_QRCODE_USAGE_HELP_TEXT = 'Usage: .qrcode <text atau URL>\nContoh: .qrcode https://example.com';
const DEFAULT_IMAGETOPDF_USAGE_HELP_TEXT = 'Kirim/reply gambar dengan .imagetopdf untuk extract text dan convert ke PDF.';
const DEFAULT_SS_USAGE_HELP_TEXT = 'Usage: .ss <url>\nAlias: .ssweb, .screenshot\nContoh: .ss https://example.com';
const DEFAULT_TTS_USAGE_HELP_TEXT = 'Usage: .tts <teks>\nContoh: .tts Assalamualaikum semua';
const SIMPLE_BUILTIN_TEXT_FIELDS = [
  { key: 'zipUsageHelpText', buttonsKey: 'zipUsageButtons', fallback: DEFAULT_ZIP_USAGE_HELP_TEXT },
  { key: 'unzipUsageHelpText', buttonsKey: 'unzipUsageButtons', fallback: DEFAULT_UNZIP_USAGE_HELP_TEXT },
  { key: 'pdf2txtUsageHelpText', buttonsKey: 'pdf2txtUsageButtons', fallback: DEFAULT_PDF2TXT_USAGE_HELP_TEXT },
  { key: 'maketxtUsageHelpText', buttonsKey: 'maketxtUsageButtons', fallback: DEFAULT_MAKETXT_USAGE_HELP_TEXT },
  { key: 'qrcodeUsageHelpText', buttonsKey: 'qrcodeUsageButtons', fallback: DEFAULT_QRCODE_USAGE_HELP_TEXT },
  { key: 'imagetopdfUsageHelpText', buttonsKey: 'imagetopdfUsageButtons', fallback: DEFAULT_IMAGETOPDF_USAGE_HELP_TEXT },
  { key: 'ssUsageHelpText', buttonsKey: 'ssUsageButtons', fallback: DEFAULT_SS_USAGE_HELP_TEXT },
  { key: 'ttsUsageHelpText', buttonsKey: 'ttsUsageButtons', fallback: DEFAULT_TTS_USAGE_HELP_TEXT },
];
const DEFAULT_SCHEDULE_USAGE_BUTTON_TEXT = 'Schedule Web';
const DEFAULT_SCHEDULE_USAGE_BUTTONS = [
  {
    name: 'cta_url',
    buttonParamsJson: JSON.stringify({
      display_text: DEFAULT_SCHEDULE_USAGE_BUTTON_TEXT,
      url: '',
      merchant_url: '',
    }),
  },
];
const schedulesById = new Map(
  (Array.isArray(window.__SCHEDULES__) ? window.__SCHEDULES__ : []).map((item) => [
    String(item.id),
    item,
  ])
);

let hasLoadedGroups = false;
let hasLoadedPersonalChats = false;
let hasLoadedSendGroups = false;
let hasLoadedSendPersonalChats = false;
let isWhatsAppReady = false;
let isSavingBotResponseSettings = false;
let chatResponseSettings = normalizeChatResponseSettings(window.__CHAT_RESPONSE_SETTINGS__ || DEFAULT_CHAT_RESPONSE_SETTINGS);
let accessControlSettings = normalizeAccessControlSettings(window.__ACCESS_CONTROL_SETTINGS__ || {});
let builtInCommandSettings = normalizeBuiltInCommandSettings(window.__BUILT_IN_COMMAND_SETTINGS__ || {});
let latestConnectedAbout = '';
let latestConnectedAvatarUrl = String(profileHomeAvatarImage?.getAttribute('src') || '').trim();
let lastRenderedQrCodeDataUrl = '';
let lastQrUpdatedAt = 0;
let qrMetaIntervalRef = null;
let isRefreshingQr = false;
let lastQrAutoRefreshAt = 0;
let hasPerformedInitialQrAutoRefresh = false;
let pairingValidationDebounceTimer = null;
let pairingValidationRequestSeq = 0;
let pairingValidationInFlight = false;
let pairingValidationBlocked = false;
let pairingValidationLastPhone = '';
let pairingValidationLastResult = null;
const QR_ESTIMATED_TTL_SECONDS = 20;
const QR_AUTO_REFRESH_COOLDOWN_MS = 8000;

const PAGE_TITLE_MAP = {
  profile: 'Profile',
  account: 'Setting',
  schedule: 'Schedule',
  'send-message': 'Send Message',
  'custom-commands': 'Custom Command',
  'vending-mechine': 'Vending Mechine',
  'vending-mechine-machines': 'Vending Mechine / Route',
  'vending-mechine-machine-products': 'Vending Mechine / Route Location',
  'vending-mechine-product-master': 'Vending Mechine / Location',
  'deleted-messages': 'Deleted Messages',
  'route-list': 'Route List',
  'osint': 'OSINT',
};

let isRouteListEditMode = false;
let vendingRoutes = [];
let vendingLocations = [];
let vendingRouteLocations = [];
let vendingRouteInlineMode = 'none';
let vendingRouteInlineEditId = '';
let vendingLocationInlineMode = 'none';
let vendingLocationInlineEditId = '';
let vendingRouteLocationInlineMode = 'none';
let vendingRouteLocationInlineEditId = '';

function getActivePageKey() {
  const activePage = pages.find((page) => !page.hidden);
  return activePage ? String(activePage.getAttribute('data-page') || '') : '';
}

function getActiveAccountSectionLabel() {
  if (accountSettingsTabs.length) {
    const activeSettingsTab = accountSettingsTabs.find((tab) => tab.classList.contains('active'));
    if (activeSettingsTab) {
      const sectionLabel = String(activeSettingsTab.dataset.accountLabel || activeSettingsTab.textContent || '').trim();
      const tabKey = String(activeSettingsTab.dataset.accountTab || '').trim();

      if (tabKey === 'linked-devices' && methodTabQr && methodTabPhone) {
        const deviceMethodLabel = methodTabPhone.classList.contains('active') ? 'Phone Number' : 'QR Code';
        return `${sectionLabel} - ${deviceMethodLabel}`;
      }

      return sectionLabel;
    }
  }

  if (!methodTabQr || !methodTabPhone) return '';
  return methodTabPhone.classList.contains('active') ? 'Phone Number' : 'QR Code';
}

function getActiveScheduleSectionLabel() {
  if (!scheduleTabCreate || !scheduleTabList) return '';
  return scheduleTabList.classList.contains('active') ? 'Schedule List' : 'Create Schedule';
}

function getActiveCommandSectionLabel() {
  if (!commandTabCreate || !commandTabList) return '';
  return commandTabList.classList.contains('active') ? 'Command List' : 'Add Command';
}

function syncCommandSectionDropdownVisibility(activePageKey = getActivePageKey()) {
  const isCommandPage = String(activePageKey || '') === 'custom-commands';

  if (commandSectionDropdown) {
    commandSectionDropdown.hidden = !isCommandPage;
  }

  if (document.body) {
    document.body.classList.toggle('is-custom-commands-page', isCommandPage);
    document.body.dataset.activePage = String(activePageKey || '');
  }
}

function updateTopBreadcrumb() {
  const activePageKey = getActivePageKey();
  const pageTitle = PAGE_TITLE_MAP[activePageKey] || 'Dashboard';

  syncCommandSectionDropdownVisibility(activePageKey);

  let sectionTitle = '';
  if (activePageKey === 'account') sectionTitle = getActiveAccountSectionLabel();
  if (activePageKey === 'schedule') sectionTitle = getActiveScheduleSectionLabel();
  if (activePageKey === 'custom-commands') sectionTitle = getActiveCommandSectionLabel();

  if (topNavTitle) topNavTitle.textContent = pageTitle;
  if (breadcrumbPage) breadcrumbPage.textContent = pageTitle;
  if (breadcrumbSection) {
    breadcrumbSection.textContent = sectionTitle;
    breadcrumbSection.hidden = !sectionTitle;
  }
  if (breadcrumbSectionSep) {
    breadcrumbSectionSep.hidden = !sectionTitle;
  }

  if (accountSettingsHeaderDropdown) {
    accountSettingsHeaderDropdown.hidden = activePageKey !== 'account';
    if (activePageKey !== 'account') closeAccountSettingsDropdown();
  }
}

function getRouteRows() {
  if (!routeListTableBody) return [];
  return Array.from(routeListTableBody.querySelectorAll('[data-route-row]'));
}

function updateRouteListOverview() {
  const rows = getRouteRows();
  const visibleRows = rows.filter((row) => !row.hidden);

  const publicCount = rows.filter((row) => {
    const select = row.querySelector('[data-route-visibility]');
    return String(select?.value || '') === 'public';
  }).length;

  const enabledCount = rows.filter((row) => {
    const toggle = row.querySelector('[data-route-enabled]');
    return Boolean(toggle?.checked);
  }).length;

  if (routeListTotalCount) routeListTotalCount.textContent = String(rows.length);
  if (routeListVisibleCount) routeListVisibleCount.textContent = String(visibleRows.length);
  if (routeListPublicCount) routeListPublicCount.textContent = String(publicCount);
  if (routeListEnabledCount) routeListEnabledCount.textContent = String(enabledCount);
}

function applyRouteListFilters() {
  const rows = getRouteRows();
  if (!rows.length) return;

  const query = String(routeListSearchInput?.value || '').trim().toLowerCase();
  const methodFilter = String(routeListMethodFilter?.value || 'all').trim().toUpperCase();

  rows.forEach((row) => {
    const method = String(row.dataset.method || '').trim().toUpperCase();
    const searchableText = String(row.dataset.search || row.textContent || '').toLowerCase();

    const methodMatch = methodFilter === 'ALL' || method === methodFilter;
    const queryMatch = !query || searchableText.includes(query);
    row.hidden = !(methodMatch && queryMatch);
  });

  updateRouteListOverview();
}

function setRouteListEditMode(isEditMode) {
  isRouteListEditMode = Boolean(isEditMode);
  const rows = getRouteRows();

  rows.forEach((row) => {
    const visibilitySelect = row.querySelector('[data-route-visibility]');
    const enabledToggle = row.querySelector('[data-route-enabled]');
    if (visibilitySelect) visibilitySelect.disabled = !isRouteListEditMode;
    if (enabledToggle) enabledToggle.disabled = !isRouteListEditMode;
    row.classList.toggle('is-editing', isRouteListEditMode);
  });

  if (routeListEditModeBtn) {
    routeListEditModeBtn.textContent = isRouteListEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode';
    routeListEditModeBtn.classList.toggle('is-ready', isRouteListEditMode);
  }

  if (routeListEditHint) {
    routeListEditHint.textContent = isRouteListEditMode
      ? 'Edit mode active. You can change visibility and enabled flags.'
      : 'Overview mode active. Click Enter Edit Mode to modify visibility and enabled flags.';
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || 'Request failed');
  }

  return payload;
}

function setVendingFeedback(element, message, color = '#5d645d') {
  if (!element) return;
  element.textContent = message;
  element.style.color = color;
}

function resetVendingRouteInlineState() {
  vendingRouteInlineMode = 'none';
  vendingRouteInlineEditId = '';
}

function updateVendingRouteAddRowButtonState() {
  if (!vendingRouteAddRowBtn) return;
  vendingRouteAddRowBtn.disabled = vendingRouteInlineMode !== 'none';
}

function resetVendingLocationInlineState() {
  vendingLocationInlineMode = 'none';
  vendingLocationInlineEditId = '';
}

function updateVendingLocationAddRowButtonState() {
  if (!vendingLocationAddRowBtn) return;
  vendingLocationAddRowBtn.disabled = vendingLocationInlineMode !== 'none';
}

function resetVendingRouteLocationInlineState() {
  vendingRouteLocationInlineMode = 'none';
  vendingRouteLocationInlineEditId = '';
}

function updateVendingRouteLocationAddRowButtonState() {
  if (!vendingRouteLocationAddRowBtn) return;
  vendingRouteLocationAddRowBtn.disabled = vendingRouteLocationInlineMode !== 'none';
}

function renderVendingRouteOptions() {
  if (!vendingRouteLocationRouteIdInput) return;

  const options = ['<option value="">Select route</option>'].concat(
    vendingRoutes.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.code)} - ${escapeHtml(item.name)}</option>`)
  );
  const current = vendingRouteLocationRouteIdInput.value;
  vendingRouteLocationRouteIdInput.innerHTML = options.join('');
  if (current && vendingRoutes.some((item) => String(item.id) === String(current))) {
    vendingRouteLocationRouteIdInput.value = current;
  }
}

function renderVendingLocationOptions() {
  if (!vendingRouteLocationLocationIdInput) return;

  const options = ['<option value="">Select location</option>'].concat(
    vendingLocations.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`)
  );
  const current = vendingRouteLocationLocationIdInput.value;
  vendingRouteLocationLocationIdInput.innerHTML = options.join('');
  if (current && vendingLocations.some((item) => String(item.id) === String(current))) {
    vendingRouteLocationLocationIdInput.value = current;
  }
}

function renderVendingRoutesTable() {
  if (!vendingRouteTableBody) return;

  updateVendingRouteAddRowButtonState();

  if (!vendingRoutes.length && vendingRouteInlineMode !== 'add') {
    vendingRouteTableBody.innerHTML = '<tr><td colspan="6" class="muted">No route yet</td></tr>';
    return;
  }

  const rows = [];

  if (vendingRouteInlineMode === 'add') {
    rows.push(`
      <tr class="is-editing">
        <td>#</td>
        <td><input type="text" data-vending-route-input-id placeholder="Route ID" /></td>
        <td><input type="text" data-vending-route-input-code placeholder="Code" /></td>
        <td><input type="text" data-vending-route-input-name placeholder="Name" /></td>
        <td><input type="text" data-vending-route-input-description placeholder="Description" /></td>
        <td class="cell-action">
          <button type="button" class="btn btn-primary btn-sm" data-vending-route-save-create>Save</button>
          <button type="button" class="btn btn-outline btn-sm" data-vending-route-cancel-inline>Cancel</button>
        </td>
      </tr>
    `);
  }

  vendingRoutes.forEach((item, index) => {
    const isEditing = vendingRouteInlineMode === 'edit' && String(item.id) === vendingRouteInlineEditId;

    if (isEditing) {
      rows.push(`
        <tr class="is-editing">
          <td>${escapeHtml(String(index + 1))}</td>
          <td>${escapeHtml(item.id)}</td>
          <td><input type="text" data-vending-route-input-code value="${escapeHtml(item.code || '')}" placeholder="Code" /></td>
          <td><input type="text" data-vending-route-input-name value="${escapeHtml(item.name || '')}" placeholder="Name" /></td>
          <td><input type="text" data-vending-route-input-description value="${escapeHtml(item.description || '')}" placeholder="Description" /></td>
          <td class="cell-action">
            <button type="button" class="btn btn-primary btn-sm" data-vending-route-save-edit="${escapeHtml(item.id)}">Save</button>
            <button type="button" class="btn btn-outline btn-sm" data-vending-route-cancel-inline>Cancel</button>
          </td>
        </tr>
      `);
      return;
    }

    rows.push(`
      <tr>
        <td>${escapeHtml(String(index + 1))}</td>
        <td>${escapeHtml(item.id)}</td>
        <td>${escapeHtml(item.code)}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.description || '-')}</td>
        <td class="cell-action">
          <button type="button" class="btn btn-ghost btn-sm" data-vending-route-edit="${escapeHtml(item.id)}" ${vendingRouteInlineMode !== 'none' ? 'disabled' : ''}>Edit</button>
          <button type="button" class="btn btn-ghost btn-sm" data-vending-route-delete="${escapeHtml(item.id)}" ${vendingRouteInlineMode !== 'none' ? 'disabled' : ''}>Delete</button>
        </td>
      </tr>
    `);
  });

  vendingRouteTableBody.innerHTML = rows.join('');
}

function renderVendingLocationsTable() {
  if (!vendingLocationTableBody) return;

  updateVendingLocationAddRowButtonState();

  if (!vendingLocations.length && vendingLocationInlineMode !== 'add') {
    vendingLocationTableBody.innerHTML = '<tr><td colspan="5" class="muted">No location yet</td></tr>';
    return;
  }

  const rows = [];

  if (vendingLocationInlineMode === 'add') {
    rows.push(`
      <tr class="is-editing">
        <td>#</td>
        <td><input type="text" data-vending-location-input-id placeholder="Location ID" /></td>
        <td><input type="text" data-vending-location-input-name placeholder="Location name" /></td>
        <td><input type="text" data-vending-location-input-delivery placeholder="Delivery" /></td>
        <td class="cell-action">
          <button type="button" class="btn btn-primary btn-sm" data-vending-location-save-create>Save</button>
          <button type="button" class="btn btn-outline btn-sm" data-vending-location-cancel-inline>Cancel</button>
        </td>
      </tr>
    `);
  }

  vendingLocations.forEach((item, index) => {
    const isEditing = vendingLocationInlineMode === 'edit' && String(item.id) === vendingLocationInlineEditId;

    if (isEditing) {
      rows.push(`
        <tr class="is-editing">
          <td>${escapeHtml(String(index + 1))}</td>
          <td>${escapeHtml(item.id)}</td>
          <td><input type="text" data-vending-location-input-name value="${escapeHtml(item.name || '')}" placeholder="Location name" /></td>
          <td><input type="text" data-vending-location-input-delivery value="${escapeHtml(item.address || '')}" placeholder="Delivery" /></td>
          <td class="cell-action">
            <button type="button" class="btn btn-primary btn-sm" data-vending-location-save-edit="${escapeHtml(item.id)}">Save</button>
            <button type="button" class="btn btn-outline btn-sm" data-vending-location-cancel-inline>Cancel</button>
          </td>
        </tr>
      `);
      return;
    }

    rows.push(`
      <tr>
        <td>${escapeHtml(String(index + 1))}</td>
        <td>${escapeHtml(item.id)}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.address || '-')}</td>
        <td class="cell-action">
          <button type="button" class="btn btn-ghost btn-sm" data-vending-location-edit="${escapeHtml(item.id)}" ${vendingLocationInlineMode !== 'none' ? 'disabled' : ''}>Edit</button>
          <button type="button" class="btn btn-ghost btn-sm" data-vending-location-delete="${escapeHtml(item.id)}" ${vendingLocationInlineMode !== 'none' ? 'disabled' : ''}>Delete</button>
        </td>
      </tr>
    `);
  });

  vendingLocationTableBody.innerHTML = rows.join('');
}

function renderVendingRouteLocationsTable() {
  if (!vendingRouteLocationTableBody) return;

  updateVendingRouteLocationAddRowButtonState();

  if (!vendingRouteLocations.length && vendingRouteLocationInlineMode !== 'add') {
    vendingRouteLocationTableBody.innerHTML = '<tr><td colspan="7" class="muted">No mapping yet</td></tr>';
    return;
  }

  const rows = [];

  if (vendingRouteLocationInlineMode === 'add') {
    rows.push(`
      <tr class="is-editing">
        <td>#</td>
        <td><input type="text" data-vending-route-location-input-id placeholder="Mapping ID" /></td>
        <td><input type="text" data-vending-route-location-input-route-id placeholder="Route ID" /></td>
        <td><input type="text" data-vending-route-location-input-location-id placeholder="Location ID" /></td>
        <td><input type="number" min="1" step="1" value="1" data-vending-route-location-input-sequence /></td>
        <td>
          <select data-vending-route-location-input-status>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </td>
        <td class="cell-action">
          <button type="button" class="btn btn-primary btn-sm" data-vending-route-location-save-create>Save</button>
          <button type="button" class="btn btn-outline btn-sm" data-vending-route-location-cancel-inline>Cancel</button>
        </td>
      </tr>
    `);
  }

  vendingRouteLocations.forEach((item, index) => {
    const isEditing = vendingRouteLocationInlineMode === 'edit' && String(item.id) === vendingRouteLocationInlineEditId;
    const statusBadgeClass = String(item.status || '').toLowerCase() === 'inactive' ? 'badge-outline' : 'badge-success';

    if (isEditing) {
      rows.push(`
        <tr class="is-editing">
          <td>${escapeHtml(String(index + 1))}</td>
          <td>${escapeHtml(item.id)}</td>
          <td><input type="text" data-vending-route-location-input-route-id value="${escapeHtml(item.routeId || '')}" placeholder="Route ID" /></td>
          <td><input type="text" data-vending-route-location-input-location-id value="${escapeHtml(item.locationId || '')}" placeholder="Location ID" /></td>
          <td><input type="number" min="1" step="1" value="${escapeHtml(String(item.sequence || 1))}" data-vending-route-location-input-sequence /></td>
          <td>
            <select data-vending-route-location-input-status>
              <option value="active" ${String(item.status || '').toLowerCase() !== 'inactive' ? 'selected' : ''}>active</option>
              <option value="inactive" ${String(item.status || '').toLowerCase() === 'inactive' ? 'selected' : ''}>inactive</option>
            </select>
          </td>
          <td class="cell-action">
            <button type="button" class="btn btn-primary btn-sm" data-vending-route-location-save-edit="${escapeHtml(item.id)}">Save</button>
            <button type="button" class="btn btn-outline btn-sm" data-vending-route-location-cancel-inline>Cancel</button>
          </td>
        </tr>
      `);
      return;
    }

    rows.push(`
        <tr>
          <td>${escapeHtml(String(index + 1))}</td>
          <td>${escapeHtml(item.id)}</td>
          <td>${escapeHtml(item.routeId || '-')}</td>
          <td>${escapeHtml(item.locationId || '-')}</td>
          <td>${escapeHtml(String(item.sequence || 1))}</td>
          <td><span class="badge ${statusBadgeClass}">${escapeHtml(item.status || 'active')}</span></td>
          <td class="cell-action">
            <button type="button" class="btn btn-ghost btn-sm" data-vending-route-location-edit="${escapeHtml(item.id)}" ${vendingRouteLocationInlineMode !== 'none' ? 'disabled' : ''}>Edit</button>
            <button type="button" class="btn btn-ghost btn-sm" data-vending-route-location-delete="${escapeHtml(item.id)}" ${vendingRouteLocationInlineMode !== 'none' ? 'disabled' : ''}>Delete</button>
          </td>
        </tr>
    `);
  });

  vendingRouteLocationTableBody.innerHTML = rows.join('');
}

async function loadVendingData() {
  const [routesRes, locationsRes, routeLocationsRes] = await Promise.all([
    requestJson('/api/vending/routes'),
    requestJson('/api/vending/locations'),
    requestJson('/api/vending/route-locations'),
  ]);

  vendingRoutes = Array.isArray(routesRes?.routes) ? routesRes.routes : [];
  vendingLocations = Array.isArray(locationsRes?.locations) ? locationsRes.locations : [];
  vendingRouteLocations = Array.isArray(routeLocationsRes?.routeLocations) ? routeLocationsRes.routeLocations : [];

  renderVendingRouteOptions();
  renderVendingLocationOptions();
  renderVendingRoutesTable();
  renderVendingLocationsTable();
  renderVendingRouteLocationsTable();
}

function formatConnectedPhone(value) {
  const digits = String(value || '').replace(/\D+/g, '');
  if (!digits) return '-';

  // Prefer an international-style display while keeping unknown formats readable.
  if (digits.startsWith('60')) {
    const rest = digits.slice(2);
    if (rest.length >= 9) {
      return `+60 ${rest.slice(0, 2)}-${rest.slice(2, 5)} ${rest.slice(5)}`;
    }
    return `+60 ${rest}`.trim();
  }

  return `+${digits}`;
}

function normalizeQrTimestamp(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.floor(numeric);
}

function formatQrFreshnessLabel(updatedAtMs) {
  if (!updatedAtMs) return 'Waiting for QR from WhatsApp...';
  const ageSeconds = Math.max(0, Math.floor((Date.now() - updatedAtMs) / 1000));
  if (ageSeconds <= 3) return 'QR updated just now. Scan quickly before it refreshes.';
  if (ageSeconds < 60) return `QR updated ${ageSeconds}s ago.`;
  const minutes = Math.floor(ageSeconds / 60);
  return `QR updated ${minutes}m ago. Tap Refresh QR if scan fails.`;
}

function getQrCountdownState(updatedAtMs) {
  if (!updatedAtMs) {
    return { secondsLeft: 0, isExpired: false };
  }

  const ageSeconds = Math.max(0, Math.floor((Date.now() - updatedAtMs) / 1000));
  const secondsLeft = Math.max(0, QR_ESTIMATED_TTL_SECONDS - ageSeconds);
  return {
    secondsLeft,
    isExpired: secondsLeft === 0,
  };
}

function renderQrCountdown(updatedAtMs) {
  if (!waQrCountdown) return;

  if (!updatedAtMs || isWhatsAppReady) {
    waQrCountdown.hidden = true;
    waQrCountdown.classList.remove('is-warning', 'is-expired');
    waQrCountdown.textContent = '';
    return;
  }

  const { secondsLeft, isExpired } = getQrCountdownState(updatedAtMs);
  waQrCountdown.hidden = false;

  if (isExpired) {
    waQrCountdown.classList.add('is-expired');
    waQrCountdown.classList.remove('is-warning');
    waQrCountdown.textContent = 'QR may be expired';
    return;
  }

  waQrCountdown.classList.remove('is-expired');
  waQrCountdown.classList.toggle('is-warning', secondsLeft <= 7);
  waQrCountdown.textContent = `Estimated refresh in ~${secondsLeft}s`;
}

async function performQrRefresh(options = {}) {
  const silent = Boolean(options.silent);
  const fromAuto = Boolean(options.fromAuto);
  if (isWhatsAppReady || isRefreshingQr) return;

  isRefreshingQr = true;
  if (!fromAuto && refreshQrBtn) {
    setButtonLoading(refreshQrBtn, true, 'Refreshing QR');
  }
  if (!silent && waQrMeta) {
    waQrMeta.textContent = fromAuto ? 'Refreshing QR automatically...' : 'Refreshing QR state...';
  }

  try {
    const response = await fetch('/api/whatsapp/refresh-qr', { method: 'POST' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Failed to refresh QR code');
    }
    renderWhatsAppState(data);

    if (!data.ready && !data.qrCodeDataUrl) {
      if (waQrMeta) {
        waQrMeta.textContent = 'Waiting for new QR from WhatsApp...';
      }

      const maxAttempts = 15;
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 1000));

        const stateResponse = await fetch('/api/whatsapp/state');
        if (!stateResponse.ok) {
          continue;
        }

        const nextState = await stateResponse.json().catch(() => null);
        if (!nextState) {
          continue;
        }

        renderWhatsAppState(nextState);
        if (nextState.ready || nextState.qrCodeDataUrl) {
          break;
        }
      }
    }

    if (!isWhatsAppReady && waQrMeta && lastQrUpdatedAt) {
      waQrMeta.textContent = formatQrFreshnessLabel(lastQrUpdatedAt);
    }
  } catch (error) {
    if (waQrMeta) {
      waQrMeta.textContent = error.message || 'Failed to refresh QR code';
    }
  } finally {
    isRefreshingQr = false;
    if (!fromAuto && refreshQrBtn) {
      setButtonLoading(refreshQrBtn, false);
      refreshQrBtn.disabled = isWhatsAppReady;
    }
  }
}

function triggerQrAutoRefreshIfStale() {
  if (!lastQrUpdatedAt || isWhatsAppReady || isRefreshingQr) return;

  const { isExpired } = getQrCountdownState(lastQrUpdatedAt);
  if (!isExpired) return;

  const now = Date.now();
  if (now - lastQrAutoRefreshAt < QR_AUTO_REFRESH_COOLDOWN_MS) return;

  lastQrAutoRefreshAt = now;
  performQrRefresh({ silent: false, fromAuto: true }).catch(() => {});
}

function stopQrMetaTicker() {
  if (!qrMetaIntervalRef) return;
  window.clearInterval(qrMetaIntervalRef);
  qrMetaIntervalRef = null;
}

function startQrMetaTicker() {
  if (qrMetaIntervalRef) return;
  qrMetaIntervalRef = window.setInterval(() => {
    if (waQrMeta && lastQrUpdatedAt) {
      waQrMeta.textContent = formatQrFreshnessLabel(lastQrUpdatedAt);
    }
    renderQrCountdown(lastQrUpdatedAt);
    triggerQrAutoRefreshIfStale();
  }, 1000);
}

function setButtonLoading(button, isLoading, loadingLabel) {
  if (!button) return;

  if (isLoading) {
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = button.textContent || '';
    }
    if (loadingLabel) {
      button.dataset.loadingLabel = loadingLabel;
      button.setAttribute('aria-label', loadingLabel);
    }
    button.classList.add('is-loading');
    button.disabled = true;
    return;
  }

  button.classList.remove('is-loading');
  if (button.dataset.originalLabel) {
    button.textContent = button.dataset.originalLabel;
    delete button.dataset.originalLabel;
  }
  delete button.dataset.loadingLabel;
  button.removeAttribute('aria-label');
}

function setRefreshButtonLoading(button, isLoading) {
  if (!button) return;

  if (isLoading) {
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = button.textContent || '';
    }
    button.textContent = 'Refreshing';
    button.setAttribute('aria-label', 'Refreshing');
    button.disabled = true;
    return;
  }

  button.disabled = false;
  if (button.dataset.originalLabel) {
    button.textContent = button.dataset.originalLabel;
    delete button.dataset.originalLabel;
  }
  button.removeAttribute('aria-label');
}

function syncModalBodyScrollLock() {
  const hasVisibleModal = Array.from(document.querySelectorAll('.modal')).some((modal) => !modal.hidden);
  document.body.style.overflow = hasVisibleModal ? 'hidden' : '';
}

let chatSelectorContext = null;

function closeChatSelectorModalFn() {
  if (chatSelectorModal) chatSelectorModal.hidden = true;
  chatSelectorContext = null;
  syncModalBodyScrollLock();
}

function renderChatSelectorList() {
  if (!chatSelectorList || !chatSelectorContext) return;

  const { targetTypeSelect, targetTypeInput, targetValueInput } = chatSelectorContext;
  const isScheduleSection = targetTypeInput !== null;
  const isGroup = targetTypeSelect?.value === 'group';

  let datalist;
  if (isScheduleSection) {
    // Schedule section
    datalist = isGroup 
      ? document.getElementById('targetValueGroupSuggestions')
      : document.getElementById('targetValuePersonalSuggestions');
  } else {
    // Send section
    datalist = isGroup
      ? document.getElementById('sendTargetValueGroupSuggestions')
      : document.getElementById('sendTargetValuePersonalSuggestions');
  }

  if (!datalist) {
    chatSelectorList.innerHTML = '';
    return;
  }

  const options = Array.from(datalist.options);
  chatSelectorList.innerHTML = '';

  if (options.length === 0) {
    chatSelectorList.innerHTML = `
      <tr>
        <td colspan="3" class="chat-selector-empty">No chats found. Click Refresh to load.</td>
      </tr>
    `;
    return;
  }

  options.forEach((option) => {
    const text = option.textContent || '';
    const value = option.value || '';
    const parts = text.split(/\s[-—]\s/);
    const label = parts[0] || text;
    const id = parts.slice(1).join(' - ') || value;

    const item = document.createElement('tr');
    item.className = 'chat-selector-row';
    item.innerHTML = `
      <td class="chat-selector-name">${escapeHtml(label)}</td>
      <td class="chat-selector-id">${escapeHtml(id)}</td>
      <td class="chat-selector-action-cell">
        <button type="button" class="btn btn-outline btn-sm chat-selector-action">Select</button>
      </td>
    `;

    const selectBtn = item.querySelector('.chat-selector-action');
    const applySelection = () => {
      if (targetValueInput) targetValueInput.value = id;
      updateSendTargetClearButtonState();
      closeChatSelectorModalFn();
    };

    item.addEventListener('click', applySelection);
    selectBtn?.addEventListener('click', (event) => {
      event.stopPropagation();
      applySelection();
    });
    chatSelectorList.appendChild(item);
  });
}

function updateSendTargetClearButtonState() {
  if (!sendTargetClearBtn || !sendTargetValueInput) return;
  sendTargetClearBtn.disabled = String(sendTargetValueInput.value || '').trim().length === 0;
}

function openChatSelectorModal(context) {
  chatSelectorContext = context;
  const { targetTypeSelect, targetTypeInput } = context;
  const isGroup = !targetTypeSelect || targetTypeSelect.value === 'group';

  if (chatSelectorModalTitle) chatSelectorModalTitle.textContent = isGroup ? 'Select Group' : 'Select Chat';
  if (chatSelectorModalDesc) chatSelectorModalDesc.textContent = isGroup ? 'Choose a group to auto-fill' : 'Choose a personal chat to auto-fill';

  renderChatSelectorList();

  if (chatSelectorModal) chatSelectorModal.hidden = false;
  syncModalBodyScrollLock();
}

function getConnectedAccountNameText() {
  const rawName = String(waConnectedName?.textContent || '').trim();
  if (!rawName || rawName === '-') return '';
  return rawName;
}

function normalizeBuiltInCommandSettings(value) {
  const source = value && typeof value === 'object' ? value : {};
  const hasScheduleButtonsArray = Object.prototype.hasOwnProperty.call(source, 'scheduleUsageButtons');
  const hasScheduleListButtonsArray = Object.prototype.hasOwnProperty.call(source, 'scheduleListButtons');
  const hasScheduleDeleteButtonsArray = Object.prototype.hasOwnProperty.call(source, 'scheduleDeleteButtons');
  const hasVvButtonsArray = Object.prototype.hasOwnProperty.call(source, 'vvUsageButtons');
  const hasStickerButtonsArray = Object.prototype.hasOwnProperty.call(source, 'stickerUsageButtons');
  const scheduleUsageHelpText = String(source.scheduleUsageHelpText || '').trim();
  const scheduleListEmptyText = String(source.scheduleListEmptyText || '').trim();
  const scheduleDeleteUsageText = String(source.scheduleDeleteUsageText || '').trim();
  const vvUsageHelpText = String(source.vvUsageHelpText || '').trim();
  const stickerUsageHelpText = String(source.stickerUsageHelpText || '').trim();
  const rawScheduleButtons = Array.isArray(source.scheduleUsageButtons) ? source.scheduleUsageButtons : [];
  const rawScheduleListButtons = Array.isArray(source.scheduleListButtons) ? source.scheduleListButtons : [];
  const rawScheduleDeleteButtons = Array.isArray(source.scheduleDeleteButtons) ? source.scheduleDeleteButtons : [];
  const rawVvButtons = Array.isArray(source.vvUsageButtons) ? source.vvUsageButtons : [];
  const rawStickerButtons = Array.isArray(source.stickerUsageButtons) ? source.stickerUsageButtons : [];

  const normalizeButtons = (list) => list
    .map((item) => {
      if (!item || typeof item !== 'object') return null;

      // Legacy format: { displayText, url }
      if (!item.name && Object.prototype.hasOwnProperty.call(item, 'displayText')) {
        const displayText = String(item.displayText || '').trim();
        if (!displayText) return null;
        const url = String(item.url || '').trim();
        return {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: displayText,
            url,
            merchant_url: url,
          }),
        };
      }

      const name = String(item.name || '').trim();
      if (!name) return null;

      let params = {};
      if (typeof item.buttonParamsJson === 'string') {
        try {
          const parsed = JSON.parse(item.buttonParamsJson);
          params = parsed && typeof parsed === 'object' ? parsed : {};
        } catch (error) {
          params = {};
        }
      } else if (item.buttonParamsJson && typeof item.buttonParamsJson === 'object') {
        params = item.buttonParamsJson;
      }

      if (!params || typeof params !== 'object') params = {};

      return {
        name,
        buttonParamsJson: JSON.stringify(params),
      };
    })
    .filter(Boolean);

  const scheduleUsageButtons = normalizeButtons(rawScheduleButtons);
  const scheduleListButtons = normalizeButtons(rawScheduleListButtons);
  const scheduleDeleteButtons = normalizeButtons(rawScheduleDeleteButtons);
  const vvUsageButtons = normalizeButtons(rawVvButtons);
  const stickerUsageButtons = normalizeButtons(rawStickerButtons);

  const result = {
    scheduleUsageHelpText: scheduleUsageHelpText || DEFAULT_SCHEDULE_USAGE_HELP_TEXT,
    scheduleListEmptyText: scheduleListEmptyText || DEFAULT_SCHEDULE_LIST_EMPTY_TEXT,
    scheduleDeleteUsageText: scheduleDeleteUsageText || DEFAULT_SCHEDULE_DELETE_USAGE_TEXT,
    vvUsageHelpText: vvUsageHelpText || DEFAULT_VV_USAGE_HELP_TEXT,
    stickerUsageHelpText: stickerUsageHelpText || DEFAULT_STICKER_USAGE_HELP_TEXT,
    scheduleUsageButtons: hasScheduleButtonsArray
      ? scheduleUsageButtons
      : DEFAULT_SCHEDULE_USAGE_BUTTONS.map((item) => ({ ...item })),
    scheduleListButtons: hasScheduleListButtonsArray ? scheduleListButtons : [],
    scheduleDeleteButtons: hasScheduleDeleteButtonsArray ? scheduleDeleteButtons : [],
    vvUsageButtons: hasVvButtonsArray ? vvUsageButtons : [],
    stickerUsageButtons: hasStickerButtonsArray ? stickerUsageButtons : [],
  };

  for (const field of SIMPLE_BUILTIN_TEXT_FIELDS) {
    const hasTextValue = String(source[field.key] || '').trim();
    const hasButtonsArray = Array.isArray(source[field.buttonsKey]);
    result[field.key] = hasTextValue || field.fallback;
    result[field.buttonsKey] = hasButtonsArray ? normalizeButtons(source[field.buttonsKey]) : [];
  }

  return result;
}

function applyBuiltInCommandSettingsUI() {
  const usageEl = document.getElementById('scheduleBuiltinUsageText');
  if (!usageEl) return;
  usageEl.textContent = builtInCommandSettings.scheduleUsageHelpText;
}

function getConnectedAccountAboutText() {
  const about = String(latestConnectedAbout || '').trim();
  if (!about || about === '-') return '';
  return about;
}

function getInitialsFromName(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'SB';
  const initials = words.slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  return initials || 'SB';
}

function applyAccountAvatar(displayName, avatarUrl) {
  if (!accountProfileAvatarImage || !accountProfileAvatarFallback) return;

  const cleanName = String(displayName || '').trim();
  const cleanAvatar = String(avatarUrl || '').trim();
  accountProfileAvatarFallback.textContent = getInitialsFromName(cleanName);

  if (cleanAvatar) {
    accountProfileAvatarImage.src = cleanAvatar;
    accountProfileAvatarImage.hidden = false;
    accountProfileAvatarFallback.hidden = true;
    return;
  }

  accountProfileAvatarImage.removeAttribute('src');
  accountProfileAvatarImage.hidden = true;
  accountProfileAvatarFallback.hidden = false;
}

function applyProfileHomeAvatar(displayName, avatarUrl) {
  if (!profileHomeAvatarImage || !profileHomeAvatarFallback) return;

  const cleanName = String(displayName || '').trim();
  const cleanAvatar = String(avatarUrl || '').trim();
  profileHomeAvatarFallback.textContent = getInitialsFromName(cleanName);

  if (cleanAvatar) {
    profileHomeAvatarImage.src = cleanAvatar;
    profileHomeAvatarImage.hidden = false;
    profileHomeAvatarFallback.hidden = true;
    return;
  }

  profileHomeAvatarImage.removeAttribute('src');
  profileHomeAvatarImage.hidden = true;
  profileHomeAvatarFallback.hidden = false;
}

function getDefaultTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (error) {
    return 'UTC';
  }
}

function readStoredTimeZone() {
  try {
    return String(window.localStorage.getItem(TIMEZONE_STORAGE_KEY) || '').trim();
  } catch (error) {
    return '';
  }
}

function writeStoredTimeZone(timeZone) {
  try {
    window.localStorage.setItem(TIMEZONE_STORAGE_KEY, String(timeZone || '').trim());
  } catch (error) {
    /* ignore storage errors */
  }
}

function isSupportedTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: String(timeZone || '').trim() }).format(new Date());
    return true;
  } catch (error) {
    return false;
  }
}

function getSelectedTimeZone() {
  const selected = String(timezoneSettingSelect?.value || '').trim();
  if (selected && isSupportedTimeZone(selected)) return selected;

  const stored = readStoredTimeZone();
  if (stored && isSupportedTimeZone(stored)) return stored;

  const browserTz = getDefaultTimeZone();
  return isSupportedTimeZone(browserTz) ? browserTz : 'UTC';
}

function getDetectedPlatformLabel() {
  const userAgentDataPlatform = String(navigator?.userAgentData?.platform || '').trim();
  if (userAgentDataPlatform) return userAgentDataPlatform;

  const platform = String(navigator?.platform || '').trim();
  if (platform) return platform;

  const userAgent = String(navigator?.userAgent || '').trim();
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';

  return 'Web';
}

function applyProfileSummaryMeta() {
  const mode = normalizeCommandMode(accessControlSettings?.commandMode || commandModeSelect?.value || 'public');
  const timeZone = getSelectedTimeZone();
  const platform = getDetectedPlatformLabel();

  if (profileHomeSummaryCommandMode) {
    profileHomeSummaryCommandMode.textContent = mode === 'private' ? 'Private' : 'Public';
  }
  if (profileHomeSummaryPlatform) {
    profileHomeSummaryPlatform.textContent = platform || 'Web';
  }
  if (profileHomeSummaryTimeZone) {
    profileHomeSummaryTimeZone.textContent = timeZone || 'UTC';
  }
}

function applyTimeZoneSettingUI() {
  if (!timezoneSettingSelect) return;

  const preferred = getSelectedTimeZone();
  const hasOption = Array.from(timezoneSettingSelect.options || []).some((item) => item.value === preferred);
  if (!hasOption && preferred) {
    const dynamic = document.createElement('option');
    dynamic.value = preferred;
    dynamic.textContent = `${preferred} (Detected)`;
    timezoneSettingSelect.appendChild(dynamic);
  }
  timezoneSettingSelect.value = preferred;

  if (timezoneSettingFeedback) {
    timezoneSettingFeedback.textContent = `Current timezone: ${preferred}`;
    timezoneSettingFeedback.style.color = '#5d645d';
  }

  applyProfileSummaryMeta();
}

function parseDateTimeLocalInput(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
  };
}

function isRecurringScheduleType(repeatType) {
  return repeatType === 'daily' || repeatType === 'weekly';
}

function buildDateTimeLocalFromTime(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{2}):(\d{2})$/);
  if (!match) return raw;

  const now = new Date();
  const datePart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return `${datePart}T${match[1]}:${match[2]}`;
}

function normalizeScheduleAtValue(repeatType, value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (!isRecurringScheduleType(repeatType)) {
    return parseDateTimeLocalInput(raw) ? raw : buildDateTimeLocalFromTime(raw);
  }

  const datetimeMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (datetimeMatch) {
    return `${datetimeMatch[4]}:${datetimeMatch[5]}`;
  }

  const timeMatch = raw.match(/^(\d{2}):(\d{2})$/);
  return timeMatch ? raw : buildDateTimeLocalFromTime(raw);
}

function updateScheduleAtInputMode() {
  if (!scheduleAtInput) return;

  const repeatType = String(scheduleRepeatTypeInput?.value || 'none').trim();
  const currentValue = String(scheduleAtInput.value || '').trim();
  const isRecurring = isRecurringScheduleType(repeatType);

  if (isRecurring) {
    scheduleAtInput.type = 'time';
    scheduleAtInput.value = normalizeScheduleAtValue(repeatType, currentValue);
    scheduleAtInput.setAttribute('step', '60');
    scheduleAtInput.setAttribute('min', '00:00');
    scheduleAtInput.setAttribute('max', '23:59');
    return;
  }

  scheduleAtInput.type = 'datetime-local';
  scheduleAtInput.value = normalizeScheduleAtValue(repeatType, currentValue);
  scheduleAtInput.removeAttribute('step');
  scheduleAtInput.removeAttribute('min');
  scheduleAtInput.removeAttribute('max');
}

function getTimeZoneOffsetMinutesAt(timeZone, date) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const map = {};
    parts.forEach((part) => {
      if (part.type !== 'literal') map[part.type] = part.value;
    });

    const asUtc = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour),
      Number(map.minute),
      Number(map.second)
    );
    return Math.round((date.getTime() - asUtc) / 60000);
  } catch (error) {
    return new Date().getTimezoneOffset();
  }
}

function getTimezoneOffsetMinutesForSchedule(scheduleAtLocal, timeZone) {
  const raw = String(scheduleAtLocal || '').trim();
  const datetimeMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  const timeMatch = raw.match(/^(\d{2}):(\d{2})$/);

  if (!datetimeMatch && !timeMatch) return new Date().getTimezoneOffset();

  const now = new Date();
  const year = datetimeMatch ? Number(datetimeMatch[1]) : now.getFullYear();
  const month = datetimeMatch ? Number(datetimeMatch[2]) : now.getMonth() + 1;
  const day = datetimeMatch ? Number(datetimeMatch[3]) : now.getDate();
  const hour = datetimeMatch ? Number(datetimeMatch[4]) : Number(timeMatch[1]);
  const minute = datetimeMatch ? Number(datetimeMatch[5]) : Number(timeMatch[2]);

  const referenceDate = new Date(Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    0,
    0
  ));

  return getTimeZoneOffsetMinutesAt(timeZone, referenceDate);
}

function normalizeOwnerNumber(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const digits = raw.replace(/\D+/g, '');
  if (!digits) return '';
  return raw.startsWith('+') ? `+${digits}` : digits;
}

function normalizeCommandMode(value) {
  return String(value || '').trim().toLowerCase() === 'private' ? 'private' : 'public';
}

function normalizeAccessControlSettings(value) {
  const source = value && typeof value === 'object' ? value : {};
  const rawTimeZone = String(source.timeZone || '').trim();
  const normalizedTimeZone = isSupportedTimeZone(rawTimeZone)
    ? rawTimeZone
    : (isSupportedTimeZone(getSelectedTimeZone()) ? getSelectedTimeZone() : 'UTC');

  return {
    ownerNumber: normalizeOwnerNumber(source.ownerNumber),
    commandMode: normalizeCommandMode(source.commandMode),
    timeZone: normalizedTimeZone,
  };
}

function applyOwnerNumberUI(value) {
  const normalized = normalizeOwnerNumber(value);
  if (ownerNumberInput && ownerNumberInput !== document.activeElement) {
    ownerNumberInput.value = normalized;
  }
  if (ownerNumberDisplay) {
    ownerNumberDisplay.textContent = normalized || '-';
  }
}

function applyCommandModeUI(value) {
  const mode = normalizeCommandMode(value);
  if (commandModeSelect) {
    commandModeSelect.value = mode;
  }
  if (commandModeDisplay) {
    commandModeDisplay.textContent = mode === 'private' ? 'Private' : 'Public';
  }
  if (accountHealthCommandMode) {
    accountHealthCommandMode.textContent = mode === 'private' ? 'Private' : 'Public';
  }

  applyProfileSummaryMeta();
}

function applyAccessControlUI(settings) {
  const normalized = normalizeAccessControlSettings(settings);
  applyOwnerNumberUI(normalized.ownerNumber);
  applyCommandModeUI(normalized.commandMode);

  if (normalized.timeZone && isSupportedTimeZone(normalized.timeZone)) {
    if (timezoneSettingSelect) {
      const hasOption = Array.from(timezoneSettingSelect.options || []).some((item) => item.value === normalized.timeZone);
      if (!hasOption) {
        const dynamic = document.createElement('option');
        dynamic.value = normalized.timeZone;
        dynamic.textContent = `${normalized.timeZone} (Saved)`;
        timezoneSettingSelect.appendChild(dynamic);
      }
      timezoneSettingSelect.value = normalized.timeZone;
    }

    writeStoredTimeZone(normalized.timeZone);
    applyTimeZoneSettingUI();
    hydrateScheduleTimesToLocal();
  }
}

async function loadAccessControlSettings() {
  try {
    const response = await fetch('/api/access-control-settings');
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch access control settings');
    }

    accessControlSettings = normalizeAccessControlSettings(data);
    applyAccessControlUI(accessControlSettings);
  } catch (error) {
    if (ownerNumberFeedback) {
      ownerNumberFeedback.textContent = error.message;
      ownerNumberFeedback.style.color = '#b42318';
    }
  }
}

async function saveAccessControlSettings(nextSettings) {
  const normalized = normalizeAccessControlSettings(nextSettings);
  const ownerDigitCount = normalized.ownerNumber.replace(/\D+/g, '').length;

  if (normalized.commandMode === 'private' && ownerDigitCount < 8) {
    if (ownerNumberFeedback) {
      ownerNumberFeedback.textContent = 'Owner number is required (minimum 8 digits) when mode is Private.';
      ownerNumberFeedback.style.color = '#b42318';
    }
    return;
  }

  setButtonLoading(ownerNumberSaveBtn, true, 'Saving access control');
  try {
    const response = await fetch('/api/access-control-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalized),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to save access control settings');
    }

    accessControlSettings = normalizeAccessControlSettings(data);
    applyAccessControlUI(accessControlSettings);

    if (ownerNumberFeedback) {
      ownerNumberFeedback.textContent = 'Access control saved successfully.';
      ownerNumberFeedback.style.color = '#136f63';
    }
  } catch (error) {
    if (ownerNumberFeedback) {
      ownerNumberFeedback.textContent = error.message;
      ownerNumberFeedback.style.color = '#b42318';
    }
  } finally {
    setButtonLoading(ownerNumberSaveBtn, false);
  }
}

function getAccountProfileDefaults() {
  return {
    name: 'WhatsApp Account',
    about: 'Connected via WhatsApp profile status.',
    email: '',
  };
}

function readStoredAccountProfile() {
  try {
    const raw = window.localStorage.getItem(ACCOUNT_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      name: String(parsed.name || '').trim(),
      about: String(parsed.about || '').trim(),
      email: String(parsed.email || '').trim(),
    };
  } catch (error) {
    return null;
  }
}

function writeStoredAccountProfile(profile) {
  try {
    window.localStorage.setItem(ACCOUNT_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    /* ignore storage errors */
  }
}

function mergeAccountProfile(profile) {
  const defaults = getAccountProfileDefaults();
  const connectedName = getConnectedAccountNameText();
  const connectedAbout = getConnectedAccountAboutText();

  return {
    name: connectedName || String(profile?.name || '').trim() || defaults.name,
    about: connectedAbout || String(profile?.about || '').trim() || defaults.about,
    email: String(profile?.email || '').trim(),
  };
}

function applyAccountProfileUI(profile) {
  const merged = mergeAccountProfile(profile);

  if (accountProfileNameInput && accountProfileNameInput !== document.activeElement) {
    accountProfileNameInput.value = merged.name;
  }
  if (accountProfileAboutInput && accountProfileAboutInput !== document.activeElement) {
    accountProfileAboutInput.value = merged.about;
  }
  if (accountProfileEmailInput && accountProfileEmailInput !== document.activeElement) {
    accountProfileEmailInput.value = merged.email;
  }

  if (accountProfileDisplayName) accountProfileDisplayName.textContent = merged.name;
  if (accountProfileDisplayStatus) accountProfileDisplayStatus.textContent = merged.about;
  if (accountProfilePreviewName) accountProfilePreviewName.textContent = merged.name;
  if (accountProfilePreviewAbout) accountProfilePreviewAbout.textContent = merged.about;
  if (accountProfilePreviewEmail) accountProfilePreviewEmail.textContent = merged.email || '-';

  if (profileHomeName) profileHomeName.textContent = merged.name;
  if (profileHomeSubtitle) profileHomeSubtitle.textContent = merged.about;
  if (profileHomeSummaryName) profileHomeSummaryName.textContent = merged.name;

  applyAccountAvatar(merged.name, latestConnectedAvatarUrl);
  applyProfileHomeAvatar(merged.name, latestConnectedAvatarUrl);
}

function hydrateAccountProfileUI() {
  const storedProfile = readStoredAccountProfile();
  const profile = mergeAccountProfile(storedProfile || {});
  applyAccountProfileUI(profile);
}

function normalizeChatResponseSettings(value) {
  const source = value && typeof value === 'object' ? value : {};
  const allowedGroupIds = Array.isArray(source.allowedGroupIds)
    ? source.allowedGroupIds.filter(Boolean)
    : [];
  const allowedSenderNumbers = Array.isArray(source.allowedSenderNumbers)
    ? source.allowedSenderNumbers.filter(Boolean)
    : [];
  return {
    personalEnabled: source.personalEnabled === true,
    groupEnabled: source.groupEnabled === true,
    selfCommandEnabled: source.selfCommandEnabled === true,
    groupFilterMode: source.groupFilterMode === 'whitelist' ? 'whitelist' : 'all',
    allowedGroupIds,
    allowedSendersMode: source.allowedSendersMode === 'specific' ? 'specific' : 'anyone',
    allowedSenderNumbers,
  };
}

function setBotResponseFeedback(message, color = '#5d645d') {
  if (!botResponseSettingsFeedback) return;
  botResponseSettingsFeedback.textContent = message;
  botResponseSettingsFeedback.style.color = color;
}

function setSwitchStatusLabel(labelElement, isEnabled) {
  if (!labelElement) return;
  labelElement.textContent = isEnabled ? 'Enabled' : 'Disabled';
}

function applyChatResponseSettingsUI(settings) {
  const normalized = normalizeChatResponseSettings(settings);

  if (toggleBotResponsePersonal) {
    toggleBotResponsePersonal.checked = normalized.personalEnabled;
    toggleBotResponsePersonal.disabled = isSavingBotResponseSettings;
  }
  if (toggleBotResponseGroup) {
    toggleBotResponseGroup.checked = normalized.groupEnabled;
    toggleBotResponseGroup.disabled = isSavingBotResponseSettings;
  }
  if (toggleBotResponseSelfCommand) {
    toggleBotResponseSelfCommand.checked = normalized.selfCommandEnabled;
    toggleBotResponseSelfCommand.disabled = isSavingBotResponseSettings;
  }

  setSwitchStatusLabel(toggleBotResponsePersonalLabel, normalized.personalEnabled);
  setSwitchStatusLabel(toggleBotResponseGroupLabel, normalized.groupEnabled);
  setSwitchStatusLabel(toggleBotResponseSelfCommandLabel, normalized.selfCommandEnabled);

  applyGroupFilterUI(normalized);
  applyAllowedSendersUI(normalized);

  if (accountHealthSelfCommand) {
    accountHealthSelfCommand.textContent = normalized.selfCommandEnabled ? 'Enabled' : 'Disabled';
  }

  if (accountChatStatePersonal) {
    accountChatStatePersonal.innerHTML = `Personal: <strong>${normalized.personalEnabled ? 'Enabled' : 'Disabled'}</strong>`;
  }

  if (accountChatStateGroup) {
    accountChatStateGroup.innerHTML = `Group: <strong>${normalized.groupEnabled ? 'Enabled' : 'Disabled'}</strong>`;
  }

  if (accountChatStateSelfCommand) {
    accountChatStateSelfCommand.innerHTML = `Self Command: <strong>${normalized.selfCommandEnabled ? 'Enabled' : 'Disabled'}</strong>`;
  }
}

// ─── Group Filter ────────────────────────────────────────────────────────────

function setGroupFilterFeedback(msg, color) {
  if (!groupFilterFeedback) return;
  groupFilterFeedback.textContent = msg;
  groupFilterFeedback.style.color = color || '';
}

function applyGroupFilterUI(settings) {
  const isAll = settings.groupFilterMode !== 'whitelist';
  if (toggleGroupFilterAll) toggleGroupFilterAll.checked = isAll;
  if (toggleGroupFilterAllLabel) toggleGroupFilterAllLabel.textContent = isAll ? 'Semua Group' : 'Group Terpilih';
  if (groupWhitelistPanel) groupWhitelistPanel.hidden = isAll;
}

let groupFilterListData = [];
let isLoadingGroups = false;

async function loadGroupList(allowedGroupIds) {
  if (!groupFilterList || isLoadingGroups) return;
  isLoadingGroups = true;
  if (groupFilterEmpty) { groupFilterEmpty.textContent = 'Memuatkan senarai group...'; groupFilterEmpty.hidden = false; }
  // Clear existing items except the empty placeholder
  Array.from(groupFilterList.children).forEach((c) => { if (c !== groupFilterEmpty) c.remove(); });
  setGroupFilterFeedback('', '');

  try {
    const res = await fetch('/api/whatsapp/groups');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memuatkan group');
    const groups = Array.isArray(data.groups) ? data.groups : [];
    if (!groups.length) {
      if (groupFilterEmpty) groupFilterEmpty.textContent = 'Tiada group dijumpai pada akaun ini.';
      return;
    }
    if (groupFilterEmpty) groupFilterEmpty.hidden = true;
    const allowed = Array.isArray(allowedGroupIds) ? allowedGroupIds : [];
    groupFilterListData = groups.map((g) => ({ ...g, checked: allowed.includes(g.id) }));
    renderGroupFilterList();
  } catch (err) {
    if (groupFilterEmpty) groupFilterEmpty.textContent = err.message || 'Ralat memuatkan group.';
  } finally {
    isLoadingGroups = false;
  }
}

function renderGroupFilterList() {
  if (!groupFilterList) return;
  Array.from(groupFilterList.children).forEach((c) => { if (c !== groupFilterEmpty) c.remove(); });
  if (groupFilterEmpty) groupFilterEmpty.hidden = true;

  if (!groupFilterListData.length) {
    if (groupFilterEmpty) { groupFilterEmpty.textContent = 'Tiada group dijumpai.'; groupFilterEmpty.hidden = false; }
    return;
  }

  groupFilterListData.forEach((group, idx) => {
    const item = document.createElement('label');
    item.className = 'group-filter-item';
    item.htmlFor = `groupFilterCheck_${idx}`;

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = `groupFilterCheck_${idx}`;
    cb.checked = group.checked;
    cb.addEventListener('change', () => { groupFilterListData[idx].checked = cb.checked; });

    const name = document.createElement('span');
    name.className = 'group-filter-name';
    name.textContent = group.name;

    const id = document.createElement('span');
    id.className = 'group-filter-id';
    id.textContent = group.id.replace('@g.us', '');

    item.appendChild(cb);
    item.appendChild(name);
    item.appendChild(id);
    groupFilterList.appendChild(item);
  });
}

async function saveGroupFilter() {
  const selected = groupFilterListData.filter((g) => g.checked).map((g) => g.id);
  try {
    setGroupFilterFeedback('Menyimpan...', '');
    const res = await fetch('/api/chat-response-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowedGroupIds: selected }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
    chatResponseSettings = normalizeChatResponseSettings(data);
    setGroupFilterFeedback(`${selected.length} group disimpan.`, '#136f63');
  } catch (err) {
    setGroupFilterFeedback(err.message, '#b42318');
  }
}

// ─── Allowed Senders ─────────────────────────────────────────────────────────

function setAllowedSendersFeedback(msg, color) {
  if (!allowedSendersFeedback) return;
  allowedSendersFeedback.textContent = msg;
  allowedSendersFeedback.style.color = color || '';
}

let pendingAllowedNumbers = [];

function applyAllowedSendersUI(settings) {
  const isAnyone = settings.allowedSendersMode !== 'specific';
  if (toggleAllowedSendersAnyone) toggleAllowedSendersAnyone.checked = isAnyone;
  if (toggleAllowedSendersAnyoneLabel) toggleAllowedSendersAnyoneLabel.textContent = isAnyone ? 'Sesiapa' : 'Nombor Terpilih';
  if (allowedSendersPanel) allowedSendersPanel.hidden = isAnyone;
  pendingAllowedNumbers = [...(settings.allowedSenderNumbers || [])];
  renderAllowedSenders();
}

function renderAllowedSenders() {
  if (!allowedSendersList) return;
  allowedSendersList.innerHTML = '';
  if (!pendingAllowedNumbers.length) {
    const empty = document.createElement('p');
    empty.className = 'filter-empty';
    empty.textContent = 'Tiada nombor ditambah. Semua pengguna akan disekat apabila mod ini aktif.';
    allowedSendersList.appendChild(empty);
    return;
  }
  pendingAllowedNumbers.forEach((num, idx) => {
    const chip = document.createElement('span');
    chip.className = 'allowed-sender-chip';
    chip.textContent = num;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'allowed-sender-remove';
    removeBtn.setAttribute('aria-label', `Buang ${num}`);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
      pendingAllowedNumbers.splice(idx, 1);
      renderAllowedSenders();
    });

    chip.appendChild(removeBtn);
    allowedSendersList.appendChild(chip);
  });
}

function addAllowedSender() {
  if (!allowedSenderInput) return;
  const raw = allowedSenderInput.value.trim().replace(/\D/g, '');
  if (!raw || raw.length < 7) {
    setAllowedSendersFeedback('Masukkan nombor yang sah (digit sahaja, min 7 digit).', '#b42318');
    return;
  }
  if (pendingAllowedNumbers.includes(raw)) {
    setAllowedSendersFeedback('Nombor ini sudah ada dalam senarai.', '#9f4f03');
    return;
  }
  pendingAllowedNumbers.push(raw);
  allowedSenderInput.value = '';
  setAllowedSendersFeedback('', '');
  renderAllowedSenders();
}

async function saveAllowedSenders() {
  try {
    setAllowedSendersFeedback('Menyimpan...', '');
    const res = await fetch('/api/chat-response-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowedSenderNumbers: pendingAllowedNumbers }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
    chatResponseSettings = normalizeChatResponseSettings(data);
    applyAllowedSendersUI(chatResponseSettings);
    setAllowedSendersFeedback(`${pendingAllowedNumbers.length} nombor disimpan.`, '#136f63');
  } catch (err) {
    setAllowedSendersFeedback(err.message, '#b42318');
  }
}

// ─────────────────────────────────────────────────────────────────────────────

async function loadChatResponseSettings() {
  try {
    const response = await fetch('/api/chat-response-settings');
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch bot response settings');
    }

    chatResponseSettings = normalizeChatResponseSettings(data);
    applyChatResponseSettingsUI(chatResponseSettings);
    setBotResponseFeedback('');
  } catch (error) {
    setBotResponseFeedback(error.message, '#b42318');
  }
}

async function saveChatResponseSettings(nextSettings) {
  isSavingBotResponseSettings = true;
  applyChatResponseSettingsUI(chatResponseSettings);
  setBotResponseFeedback('Saving bot response settings...');

  try {
    const response = await fetch('/api/chat-response-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextSettings),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update bot response settings');
    }

    chatResponseSettings = normalizeChatResponseSettings(data);
    setBotResponseFeedback('Bot response settings updated successfully.', '#136f63');
  } catch (error) {
    setBotResponseFeedback(error.message, '#b42318');
  } finally {
    isSavingBotResponseSettings = false;
    applyChatResponseSettingsUI(chatResponseSettings);
  }
}

function setActiveAccountSettingsTab(tabKey) {
  if (!accountSettingsTabs.length || !accountSettingsPanels.length) return;

  const normalizedTabKey = String(tabKey || '').trim();
  let hasMatchedTab = false;

  accountSettingsTabs.forEach((tab) => {
    const isActive = String(tab.dataset.accountTab || '') === normalizedTabKey;
    tab.classList.toggle('active', isActive);
    if (isActive) hasMatchedTab = true;
  });

  const fallbackTab = accountSettingsTabs[0];
  const activeTabKey = hasMatchedTab
    ? normalizedTabKey
    : String(fallbackTab?.dataset.accountTab || 'profile').trim();

  if (!hasMatchedTab && fallbackTab) {
    fallbackTab.classList.add('active');
  }

  accountSettingsPanels.forEach((panel) => {
    panel.hidden = String(panel.dataset.accountPanel || '') !== activeTabKey;
  });

  accountSettingsTabs.forEach((tab) => {
    tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
  });

  if (accountSettingsDropdownLabel) {
    const activeTab = accountSettingsTabs.find((tab) => tab.classList.contains('active'));
    accountSettingsDropdownLabel.textContent = String(
      activeTab?.dataset.accountLabel || activeTab?.textContent || 'Account'
    ).trim();
  }

  closeAccountSettingsDropdown();

  updateTopBreadcrumb();
}

function closeAccountSettingsDropdown() {
  if (!accountSettingsNav || !accountSettingsDropdownTrigger) return;
  accountSettingsNav.classList.remove('open');
  accountSettingsDropdownTrigger.setAttribute('aria-expanded', 'false');
}

function toggleAccountSettingsDropdown() {
  if (!accountSettingsNav || !accountSettingsDropdownTrigger) return;
  const isOpen = accountSettingsNav.classList.toggle('open');
  accountSettingsDropdownTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

function applyTheme(theme) {
  const normalized = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', normalized);
  document.documentElement.style.colorScheme = normalized === 'light' ? 'light' : 'dark';
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, normalized);
  } catch (error) {
    /* ignore storage errors */
  }

  if (themeToggleBtn) {
    const isLight = normalized === 'light';
    themeToggleBtn.setAttribute('aria-pressed', String(isLight));
    themeToggleBtn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    themeToggleBtn.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
  }
}

function initTheme() {
  let storedTheme = null;
  try {
    storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    storedTheme = null;
  }

  const prefersLightMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const initialTheme = storedTheme === 'light' || storedTheme === 'dark'
    ? storedTheme
    : (prefersLightMode ? 'light' : 'dark');
  applyTheme(initialTheme);
}

initTheme();
hydrateAccountProfileUI();
applyTimeZoneSettingUI();
applyAccessControlUI(accessControlSettings);
applyChatResponseSettingsUI(chatResponseSettings);
applyProfileSummaryMeta();

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  });
}

function openSidebar() {
  if (!sidebar || !sidebarOverlay) return;
  if (window.matchMedia && !window.matchMedia('(max-width: 920px)').matches) return;
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('active');
}

function closeSidebar() {
  if (!sidebar || !sidebarOverlay) return;
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
}

async function copyTextToClipboard(value) {
  const raw = String(value || '');
  if (!raw) throw new Error('No text to copy');

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(raw);
    return;
  }

  const temp = document.createElement('textarea');
  temp.value = raw;
  temp.setAttribute('readonly', 'readonly');
  temp.style.position = 'fixed';
  temp.style.opacity = '0';
  temp.style.pointerEvents = 'none';
  document.body.appendChild(temp);
  temp.select();
  document.execCommand('copy');
  document.body.removeChild(temp);
}

function ensureScheduleShareLinkInButtons(buttons, shareUrl) {
  const normalizedShareUrl = String(shareUrl || '').trim();
  if (!normalizedShareUrl) return [];

  const source = Array.isArray(buttons) ? buttons : [];
  const normalized = [];
  let hasShareLinkButton = false;

  source.forEach((item) => {
    if (!item || typeof item !== 'object') return;

    const name = String(item.name || '').trim();
    if (!name) return;

    let params = {};
    if (typeof item.buttonParamsJson === 'string') {
      try {
        const parsed = JSON.parse(item.buttonParamsJson);
        params = parsed && typeof parsed === 'object' ? parsed : {};
      } catch (error) {
        params = {};
      }
    } else if (item.buttonParamsJson && typeof item.buttonParamsJson === 'object') {
      params = item.buttonParamsJson;
    }

    if (name === 'cta_url') {
      const url = String(params.url || '').trim() || normalizedShareUrl;
      const merchantUrl = String(params.merchant_url || '').trim() || url;
      if (url === normalizedShareUrl) {
        hasShareLinkButton = true;
      }

      normalized.push({
        name,
        buttonParamsJson: JSON.stringify({
          ...params,
          display_text: String(params.display_text || '').trim() || DEFAULT_SCHEDULE_USAGE_BUTTON_TEXT,
          url,
          merchant_url: merchantUrl,
        }),
      });
      return;
    }

    normalized.push({
      name,
      buttonParamsJson: JSON.stringify(params || {}),
    });
  });

  if (!hasShareLinkButton) {
    normalized.push({
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: DEFAULT_SCHEDULE_USAGE_BUTTON_TEXT,
        url: normalizedShareUrl,
        merchant_url: normalizedShareUrl,
      }),
    });
  }

  return normalized;
}

async function syncScheduleShareLinkToBuiltInSettings(shareUrl) {
  const nextButtons = ensureScheduleShareLinkInButtons(
    builtInCommandSettings?.scheduleUsageButtons,
    shareUrl
  );

  if (!nextButtons.length) return;

  const response = await fetch('/api/built-in-commands', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scheduleUsageHelpText: String(builtInCommandSettings?.scheduleUsageHelpText || '').trim() || DEFAULT_SCHEDULE_USAGE_HELP_TEXT,
      scheduleUsageButtons: nextButtons,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Failed to sync schedule share link');
  }

  builtInCommandSettings = normalizeBuiltInCommandSettings(data);
  applyBuiltInCommandSettingsUI();
}

function setActiveNavItemByHash(hash) {
  if (!navItems.length) return;
  let normalizedHash = String(hash || '');
  if (normalizedHash.startsWith('#vending-mechine-')) {
    normalizedHash = '#vending-mechine';
  }

  navItems.forEach((item) => {
    const href = item.getAttribute('href') || '';
    item.classList.toggle('active', href === normalizedHash);
  });
}

function showPageByHash(hash) {
  if (!pages.length) return;

  const normalizedHash = String(hash || '').replace('#', '') || DEFAULT_PAGE_HASH.replace('#', '');
  const targetPage = pages.find((page) => page.getAttribute('data-page') === normalizedHash);
  const fallbackPage = pages.find((page) => page.getAttribute('data-page') === DEFAULT_PAGE_HASH.replace('#', ''));
  const pageToShow = targetPage || fallbackPage || pages[0];

  pages.forEach((page) => {
    page.hidden = page !== pageToShow;
    if (page !== pageToShow) {
      page.classList.remove('page-animate');
    }
  });

  pageToShow.classList.remove('page-animate');
  window.requestAnimationFrame(() => {
    pageToShow.classList.add('page-animate');
  });

  setActiveNavItemByHash(`#${pageToShow.getAttribute('data-page')}`);
  syncCommandSectionDropdownVisibility(pageToShow.getAttribute('data-page') || '');
  updateTopBreadcrumb();
}

function formatLocalDateTime(isoString) {
  const parsed = new Date(String(isoString || ''));
  if (Number.isNaN(parsed.getTime())) return null;
  const selectedTimeZone = getSelectedTimeZone();

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: selectedTimeZone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(parsed);
}

function hydrateScheduleTimesToLocal() {
  document.querySelectorAll('.js-local-datetime').forEach((cell) => {
    const iso = cell.getAttribute('data-iso');
    const localText = formatLocalDateTime(iso);
    if (!localText) return;

    cell.textContent = localText;
    cell.title = String(iso || '');
  });
}

function getNormalizedPairingPhoneValue() {
  if (!pairingPhoneInput) return '';
  const rawValue = String(pairingPhoneInput.value || '').trim();
  const digitsOnly = rawValue.replace(/\D+/g, '');
  return rawValue.startsWith('+') ? `+${digitsOnly}` : digitsOnly;
}

function setPairingFeedbackText(text, color = '#5d645d') {
  if (!pairingFeedback) return;
  pairingFeedback.textContent = String(text || '');
  pairingFeedback.style.color = color;
}

function updatePairingRequestButtonState() {
  if (!requestPairingBtn) return;

  const hasPhone = Boolean(getNormalizedPairingPhoneValue());
  const shouldDisable = isWhatsAppReady || pairingValidationInFlight || pairingValidationBlocked || !hasPhone;
  requestPairingBtn.disabled = shouldDisable;
}

async function validatePairingPhoneNumber(phoneNumber, options = {}) {
  const normalizedPhone = String(phoneNumber || '').trim();
  const { force = false, showPending = true } = options;

  if (!normalizedPhone) {
    pairingValidationBlocked = true;
    pairingValidationLastPhone = '';
    pairingValidationLastResult = null;
    updatePairingRequestButtonState();
    return { ok: false, error: 'Please enter a phone number' };
  }

  const digitCount = normalizedPhone.replace(/\D+/g, '').length;
  if (digitCount < 8) {
    pairingValidationBlocked = true;
    pairingValidationLastPhone = normalizedPhone;
    pairingValidationLastResult = { valid: false, error: 'Phone number seems too short' };
    if (!isWhatsAppReady) {
      setPairingFeedbackText('Phone number seems too short.', '#b42318');
    }
    updatePairingRequestButtonState();
    return { ok: false, error: 'Phone number seems too short' };
  }

  if (!force && pairingValidationLastPhone === normalizedPhone && pairingValidationLastResult) {
    return {
      ok: Boolean(pairingValidationLastResult.valid),
      data: pairingValidationLastResult,
      cached: true,
    };
  }

  const requestSeq = ++pairingValidationRequestSeq;
  pairingValidationInFlight = true;
  updatePairingRequestButtonState();

  if (showPending && !isWhatsAppReady) {
    setPairingFeedbackText('Checking phone number...', '#5d645d');
  }

  try {
    const response = await fetch('/api/phone/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: normalizedPhone }),
    });

    const payload = await response.json().catch(() => ({}));
    if (requestSeq !== pairingValidationRequestSeq) {
      return { ok: false, stale: true };
    }

    pairingValidationLastPhone = normalizedPhone;
    pairingValidationLastResult = payload;

    if (response.ok) {
      pairingValidationBlocked = false;

      if (!isWhatsAppReady) {
        const infoParts = [];
        if (payload.countryName) infoParts.push(payload.countryName);
        if (payload.lineType) infoParts.push(payload.lineType);
        const infoText = infoParts.length ? ` (${infoParts.join(', ')})` : '';

        if (payload.enabled === false) {
          setPairingFeedbackText('Phone format looks OK. NumVerify API is not configured.', '#5d645d');
        } else {
          setPairingFeedbackText(`Phone number looks valid${infoText}.`, '#136f63');
        }
      }

      return { ok: true, data: payload };
    }

    const errorMessage = String(payload.error || 'Phone number is invalid').trim();
    pairingValidationBlocked = true;
    if (!isWhatsAppReady) {
      setPairingFeedbackText(errorMessage, '#b42318');
    }
    return { ok: false, data: payload, error: errorMessage };
  } catch (error) {
    if (requestSeq !== pairingValidationRequestSeq) {
      return { ok: false, stale: true };
    }

    // Do not block pairing on transient validation transport failures.
    pairingValidationBlocked = false;
    pairingValidationLastPhone = normalizedPhone;
    pairingValidationLastResult = { valid: true, warning: true };
    if (!isWhatsAppReady) {
      setPairingFeedbackText('Unable to validate now. You can still request pairing code.', '#b54708');
    }
    return {
      ok: true,
      warning: true,
      error: error.message || 'Unable to validate phone number',
    };
  } finally {
    if (requestSeq === pairingValidationRequestSeq) {
      pairingValidationInFlight = false;
      updatePairingRequestButtonState();
    }
  }
}

function schedulePairingPhoneValidation() {
  if (pairingValidationDebounceTimer) {
    clearTimeout(pairingValidationDebounceTimer);
    pairingValidationDebounceTimer = null;
  }

  const normalizedPhone = getNormalizedPairingPhoneValue();
  if (!normalizedPhone) {
    pairingValidationBlocked = true;
    pairingValidationLastPhone = '';
    pairingValidationLastResult = null;
    if (!isWhatsAppReady) {
      setPairingFeedbackText('');
    }
    updatePairingRequestButtonState();
    return;
  }

  pairingValidationBlocked = false;
  updatePairingRequestButtonState();
  pairingValidationDebounceTimer = setTimeout(() => {
    validatePairingPhoneNumber(normalizedPhone, { force: true, showPending: true });
  }, 450);
}

function renderWhatsAppState(state) {
  if (!state) return;

  const isReady = Boolean(state.ready);
  isWhatsAppReady = isReady;
  document.body.classList.toggle('wa-ready', isReady);
  const statusText = isReady
    ? 'Bot connected successfully'
    : String(state.status || 'Initializing...');
  const qrCodeDataUrl = typeof state.qrCodeDataUrl === 'string' ? state.qrCodeDataUrl : '';
  const qrCodeUpdatedAt = normalizeQrTimestamp(state.qrCodeUpdatedAt);
  const connectedAccount = state.connectedAccount && typeof state.connectedAccount === 'object'
    ? state.connectedAccount
    : {};
  const connectedNameText = String(connectedAccount.displayName || '').trim() || '-';
  const connectedAboutText = String(connectedAccount.about || '').trim();
  const connectedAvatarUrl = String(connectedAccount.avatarUrl || '').trim();
  const effectiveAvatarUrl = connectedAvatarUrl || latestConnectedAvatarUrl;
  const connectedPhoneText = formatConnectedPhone(connectedAccount.phoneNumber);
  const connectedJidText = String(connectedAccount.jid || '').trim() || '-';

  latestConnectedAbout = connectedAboutText;
  latestConnectedAvatarUrl = effectiveAvatarUrl;

  if (waStatus) {
    waStatus.textContent = statusText;
    waStatus.classList.remove('status-ok', 'status-warn');
    waStatus.classList.add(isReady ? 'status-ok' : 'status-warn');
  }

  if (linkedDevicesConnectionState) {
    linkedDevicesConnectionState.classList.remove('status-ok', 'status-warn');
    linkedDevicesConnectionState.classList.add(isReady ? 'status-ok' : 'status-warn');
    linkedDevicesConnectionState.innerHTML = isReady
      ? '<span aria-hidden="true">✓</span><span>Connected</span>'
      : '<span aria-hidden="true">○</span><span>Waiting for connection</span>';
  }

  if (accountHealthConnection) {
    accountHealthConnection.textContent = isReady ? 'Online' : 'Offline';
  }

  if (waConnectedWrap) {
    waConnectedWrap.hidden = true;
  }

  if (waConnectedDetails) {
    waConnectedDetails.hidden = true;
  }
  if (waConnectedName) {
    waConnectedName.textContent = connectedNameText;
  }
  if (waConnectedPhone) {
    waConnectedPhone.textContent = connectedPhoneText;
  }
  if (waConnectedJid) {
    waConnectedJid.textContent = connectedJidText;
  }

  if (profileHomeSummaryPhone) {
    profileHomeSummaryPhone.textContent = connectedPhoneText;
  }

  if (profileHomeSummaryJid) {
    profileHomeSummaryJid.textContent = connectedJidText;
  }

  if (profileHomeName && connectedNameText && connectedNameText !== '-') {
    profileHomeName.textContent = connectedNameText;
  }

  if (profileHomeSummaryName && connectedNameText && connectedNameText !== '-') {
    profileHomeSummaryName.textContent = connectedNameText;
  }

  if (profileHomeSubtitle) {
    profileHomeSubtitle.textContent = connectedAboutText || 'Manage your bot profile, account settings, and command behavior.';
  }

  if (profileHomeConnectionBadge) {
    const statusSpan = profileHomeConnectionBadge.querySelector('span');
    if (statusSpan) {
      statusSpan.textContent = isReady ? 'Online' : 'Offline';
      profileHomeConnectionBadge.classList.toggle('is-offline', !isReady);
    }
  }

  const avatarName = connectedNameText && connectedNameText !== '-'
    ? connectedNameText
    : String(profileHomeName?.textContent || 'WhatsApp Account');
  applyProfileHomeAvatar(avatarName, effectiveAvatarUrl);

  if (methodTabPhone) {
    methodTabPhone.disabled = isReady;
  }

  if (pairingPhoneInput) {
    pairingPhoneInput.disabled = isReady;
  }

  if (requestPairingBtn) {
    updatePairingRequestButtonState();
  }

  if (pairingFeedback && isReady) {
    pairingFeedback.textContent = 'Pairing via phone number is disabled while WhatsApp is connected.';
    pairingFeedback.style.color = '#5d645d';
  }

  if (accountTargetTips) {
    accountTargetTips.hidden = isReady;
  }

  if (waQrWrap && waQrImage && waQrEmpty) {
    if (isReady) {
      stopQrMetaTicker();
      lastRenderedQrCodeDataUrl = '';
      lastQrUpdatedAt = 0;
      lastQrAutoRefreshAt = 0;
      hasPerformedInitialQrAutoRefresh = false;
      waQrImage.removeAttribute('src');
      waQrImage.hidden = true;
      waQrWrap.hidden = false;
      waQrWrap.classList.add('is-connected');
      if (waQrFrameWrap) waQrFrameWrap.hidden = true;
      if (waQrConnectedBanner) waQrConnectedBanner.hidden = false;
      if (waQrInstructions) waQrInstructions.hidden = true;
      if (waQrActions) waQrActions.hidden = true;
      waQrEmpty.hidden = true;
      if (waQrCaption) {
        waQrCaption.textContent = 'WhatsApp already connected. QR scan is not required.';
        waQrCaption.hidden = false;
      }
      if (waQrMeta) {
        waQrMeta.textContent = 'Connected. QR login is disabled while session is active.';
      }
      renderQrCountdown(0);
    } else if (qrCodeDataUrl) {
      if (qrCodeUpdatedAt) {
        lastQrUpdatedAt = qrCodeUpdatedAt;
      }

      if (lastRenderedQrCodeDataUrl !== qrCodeDataUrl) {
        waQrImage.src = qrCodeDataUrl;
        waQrImage.alt = 'Scan this WhatsApp QR code to connect';
        lastRenderedQrCodeDataUrl = qrCodeDataUrl;
        if (!lastQrUpdatedAt) {
          lastQrUpdatedAt = Date.now();
        }
        lastQrAutoRefreshAt = 0;
      }
      waQrImage.hidden = false;
      waQrWrap.hidden = false;
      waQrWrap.classList.remove('is-connected');
      if (waQrFrameWrap) waQrFrameWrap.hidden = false;
      if (waQrConnectedBanner) waQrConnectedBanner.hidden = true;
      if (waQrInstructions) waQrInstructions.hidden = false;
      if (waQrActions) waQrActions.hidden = false;
      waQrEmpty.hidden = true;
      if (waQrCaption) {
        waQrCaption.textContent = 'Scan this QR code from WhatsApp to connect the bot. QR refreshes automatically.';
        waQrCaption.hidden = false;
      }
      if (waQrMeta) {
        waQrMeta.textContent = formatQrFreshnessLabel(lastQrUpdatedAt);
      }
      renderQrCountdown(lastQrUpdatedAt);
      startQrMetaTicker();

      if (!hasPerformedInitialQrAutoRefresh && !isRefreshingQr) {
        hasPerformedInitialQrAutoRefresh = true;
        if (waQrMeta) {
          waQrMeta.textContent = 'Preparing a fresh QR code...';
        }
        performQrRefresh({ silent: true, fromAuto: true }).catch(() => {
          hasPerformedInitialQrAutoRefresh = false;
        });
      }
    } else {
      stopQrMetaTicker();
      lastRenderedQrCodeDataUrl = '';
      lastQrUpdatedAt = 0;
      lastQrAutoRefreshAt = 0;
      waQrImage.removeAttribute('src');
      waQrImage.hidden = true;
      waQrWrap.hidden = true;
      waQrWrap.classList.remove('is-connected');
      if (waQrFrameWrap) waQrFrameWrap.hidden = true;
      if (waQrConnectedBanner) waQrConnectedBanner.hidden = true;
      if (waQrInstructions) waQrInstructions.hidden = false;
      if (waQrActions) waQrActions.hidden = false;
      waQrEmpty.hidden = false;
      if (waQrCaption) {
        waQrCaption.textContent = '';
        waQrCaption.hidden = true;
      }
      if (waQrMeta) {
        waQrMeta.textContent = 'Waiting for QR from WhatsApp...';
      }
      renderQrCountdown(0);
    }
  }

  const pairingCode = typeof state.pairingCode === 'string' ? state.pairingCode : '';
  if (pairingCodeWrap && pairingCodeValue) {
    if (pairingCode) {
      pairingCodeValue.textContent = pairingCode;
      pairingCodeWrap.hidden = false;
    } else {
      pairingCodeValue.textContent = '';
      pairingCodeWrap.hidden = true;
    }
  }

  if (isReady) {
    setActiveConnectionMethod('qr');
  }

  // Keep profile header synced with connected account name when no custom profile is saved.
  applyAccountProfileUI(readStoredAccountProfile() || {});
}

function setActiveConnectionMethod(method) {
  if (!methodTabQr || !methodTabPhone || !qrMethodPanel || !phoneMethodPanel) return;

  const isPhone = method === 'phone';
  methodTabQr.classList.toggle('active', !isPhone);
  methodTabPhone.classList.toggle('active', isPhone);
  qrMethodPanel.hidden = isPhone;
  phoneMethodPanel.hidden = !isPhone;
  updateTopBreadcrumb();
}

function setTabbedPanel(activeTabKey, tabs, panels, options = {}) {
  const hasCreateTab = Boolean(tabs.create);
  const hasListTab = Boolean(tabs.list);
  const hasCreatePanel = Boolean(panels.create);
  const hasListPanel = Boolean(panels.list);

  if (!hasCreateTab || !hasListTab || !hasCreatePanel || !hasListPanel) return;

  const isList = activeTabKey === 'list';
  tabs.create.classList.toggle('active', !isList);
  tabs.list.classList.toggle('active', isList);
  tabs.create.setAttribute('aria-selected', String(!isList));
  tabs.list.setAttribute('aria-selected', String(isList));

  panels.create.hidden = isList;
  panels.list.hidden = !isList;

  if (options.dropdownLabel) {
    const createLabel = String(options.createLabel || tabs.create.textContent || 'Create').trim();
    const listLabel = String(options.listLabel || tabs.list.textContent || 'List').trim();
    options.dropdownLabel.textContent = isList ? listLabel : createLabel;
  }

  if (options.dropdownTrigger) {
    options.dropdownTrigger.setAttribute('aria-expanded', 'false');
  }
  if (options.dropdownNav) {
    options.dropdownNav.classList.remove('open');
  }

  updateTopBreadcrumb();
}

if (methodTabQr) {
  methodTabQr.addEventListener('click', () => {
    setActiveAccountSettingsTab('linked-devices');
    setActiveConnectionMethod('qr');
  });
}

if (methodTabPhone) {
  methodTabPhone.addEventListener('click', () => {
    if (isWhatsAppReady) return;
    setActiveAccountSettingsTab('linked-devices');
    setActiveConnectionMethod('phone');
  });
}

if (accountSettingsTabs.length) {
  accountSettingsTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setActiveAccountSettingsTab(tab.dataset.accountTab || 'account');
    });
  });

  const initiallyActiveAccountTab = accountSettingsTabs.find((tab) => tab.classList.contains('active'));
  setActiveAccountSettingsTab(initiallyActiveAccountTab?.dataset.accountTab || 'account');
}

if (accountSettingsDropdownTrigger && accountSettingsNav) {
  accountSettingsDropdownTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleAccountSettingsDropdown();
  });

  document.addEventListener('click', (event) => {
    if (!accountSettingsNav.classList.contains('open')) return;
    if (accountSettingsNav.contains(event.target) || accountSettingsDropdownTrigger.contains(event.target)) return;
    closeAccountSettingsDropdown();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAccountSettingsDropdown();
  });
}

function attachAvatarRecovery(imageElement, fallbackElement) {
  if (!imageElement || !fallbackElement) return;

  imageElement.addEventListener('error', () => {
    imageElement.hidden = true;
    imageElement.removeAttribute('src');
    fallbackElement.hidden = false;

    // Try to refresh latest signed profile image URL from backend state.
    refreshWhatsAppState().catch(() => {});
  });
}

attachAvatarRecovery(accountProfileAvatarImage, accountProfileAvatarFallback);
attachAvatarRecovery(profileHomeAvatarImage, profileHomeAvatarFallback);

if (accountProfileForm) {
  accountProfileForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const profile = mergeAccountProfile({
      name: String(accountProfileNameInput?.value || '').trim(),
      about: String(accountProfileAboutInput?.value || '').trim(),
      email: String(accountProfileEmailInput?.value || '').trim(),
    });

    writeStoredAccountProfile(profile);
    applyAccountProfileUI(profile);

    if (accountProfileFeedback) {
      accountProfileFeedback.textContent = 'Profile updated successfully.';
      accountProfileFeedback.style.color = '#136f63';
    }
  });
}

function saveTimezoneSettingFromSelection() {
  const selected = String(timezoneSettingSelect?.value || '').trim();
  if (!selected || !isSupportedTimeZone(selected)) {
    if (timezoneSettingFeedback) {
      timezoneSettingFeedback.textContent = 'Invalid timezone selected.';
      timezoneSettingFeedback.style.color = '#b42318';
    }
    return false;
  }

  writeStoredTimeZone(selected);
  applyTimeZoneSettingUI();
  hydrateScheduleTimesToLocal();

  if (timezoneSettingFeedback) {
    timezoneSettingFeedback.textContent = `Timezone saved: ${selected}`;
    timezoneSettingFeedback.style.color = '#136f63';
  }

  return true;
}

if (ownerNumberInput) {
  ownerNumberInput.addEventListener('input', () => {
    const normalized = normalizeOwnerNumber(ownerNumberInput.value);
    if (ownerNumberInput.value !== normalized) {
      ownerNumberInput.value = normalized;
    }
  });
}

if (ownerNumberSaveBtn) {
  ownerNumberSaveBtn.addEventListener('click', () => {
    saveTimezoneSettingFromSelection();
    saveAccessControlSettings({
      ownerNumber: normalizeOwnerNumber(ownerNumberInput?.value || ''),
      commandMode: normalizeCommandMode(commandModeSelect?.value || 'public'),
      timeZone: getSelectedTimeZone(),
    });
  });
}

if (commandModeSelect) {
  commandModeSelect.addEventListener('change', () => {
    applyCommandModeUI(commandModeSelect.value);
  });
}

if (toggleBotResponsePersonal) {
  toggleBotResponsePersonal.addEventListener('change', () => {
    const desired = Boolean(toggleBotResponsePersonal.checked);
    saveChatResponseSettings({
      personalEnabled: desired,
      groupEnabled: chatResponseSettings.groupEnabled,
      selfCommandEnabled: chatResponseSettings.selfCommandEnabled,
    });
  });
}

if (toggleBotResponseGroup) {
  toggleBotResponseGroup.addEventListener('change', () => {
    const desired = Boolean(toggleBotResponseGroup.checked);
    saveChatResponseSettings({
      personalEnabled: chatResponseSettings.personalEnabled,
      groupEnabled: desired,
      selfCommandEnabled: chatResponseSettings.selfCommandEnabled,
    });
  });
}

if (toggleBotResponseSelfCommand) {
  toggleBotResponseSelfCommand.addEventListener('change', () => {
    const desired = Boolean(toggleBotResponseSelfCommand.checked);
    saveChatResponseSettings({
      personalEnabled: chatResponseSettings.personalEnabled,
      groupEnabled: chatResponseSettings.groupEnabled,
      selfCommandEnabled: desired,
    });
  });
}

// ─── Group Filter Events ──────────────────────────────────────────────────────

if (toggleGroupFilterAll) {
  toggleGroupFilterAll.addEventListener('change', async () => {
    const isAll = toggleGroupFilterAll.checked;
    const nextMode = isAll ? 'all' : 'whitelist';
    try {
      const res = await fetch('/api/chat-response-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupFilterMode: nextMode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
      chatResponseSettings = normalizeChatResponseSettings(data);
      applyGroupFilterUI(chatResponseSettings);
      setGroupFilterFeedback('', '');
      // Auto-load group list when switching to whitelist mode and list is empty
      if (!isAll && !groupFilterListData.length) {
        await loadGroupList(chatResponseSettings.allowedGroupIds);
      }
    } catch (err) {
      setGroupFilterFeedback(err.message, '#b42318');
      // Revert toggle on error
      if (toggleGroupFilterAll) toggleGroupFilterAll.checked = !isAll;
      if (toggleGroupFilterAllLabel) toggleGroupFilterAllLabel.textContent = !isAll ? 'Semua Group' : 'Group Terpilih';
    }
  });
}

if (refreshGroupListBtn) {
  refreshGroupListBtn.addEventListener('click', () => loadGroupList(chatResponseSettings.allowedGroupIds));
}

if (saveGroupFilterBtn) {
  saveGroupFilterBtn.addEventListener('click', saveGroupFilter);
}

// ─── Allowed Senders Events ───────────────────────────────────────────────────

if (toggleAllowedSendersAnyone) {
  toggleAllowedSendersAnyone.addEventListener('change', async () => {
    const isAnyone = toggleAllowedSendersAnyone.checked;
    const nextMode = isAnyone ? 'anyone' : 'specific';
    try {
      const res = await fetch('/api/chat-response-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowedSendersMode: nextMode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
      chatResponseSettings = normalizeChatResponseSettings(data);
      applyAllowedSendersUI(chatResponseSettings);
      setAllowedSendersFeedback('', '');
    } catch (err) {
      setAllowedSendersFeedback(err.message, '#b42318');
      if (toggleAllowedSendersAnyone) toggleAllowedSendersAnyone.checked = !isAnyone;
      if (toggleAllowedSendersAnyoneLabel) toggleAllowedSendersAnyoneLabel.textContent = !isAnyone ? 'Sesiapa' : 'Nombor Terpilih';
    }
  });
}

if (addAllowedSenderBtn) {
  addAllowedSenderBtn.addEventListener('click', addAllowedSender);
}

if (allowedSenderInput) {
  allowedSenderInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addAllowedSender(); }
  });
}

if (saveAllowedSendersBtn) {
  saveAllowedSendersBtn.addEventListener('click', saveAllowedSenders);
}

// ─────────────────────────────────────────────────────────────────────────────

if (scheduleTabCreate) {
  scheduleTabCreate.addEventListener('click', () => {
    setTabbedPanel(
      'create',
      { create: scheduleTabCreate, list: scheduleTabList },
      { create: scheduleCreatePanel, list: scheduleListPanel },
      {
        dropdownLabel: scheduleSectionDropdownLabel,
        dropdownTrigger: scheduleSectionDropdownTrigger,
        dropdownNav: scheduleSectionNav,
        createLabel: 'Create Schedule',
        listLabel: 'Schedule List',
      }
    );
  });
}

if (scheduleTabList) {
  scheduleTabList.addEventListener('click', () => {
    setTabbedPanel(
      'list',
      { create: scheduleTabCreate, list: scheduleTabList },
      { create: scheduleCreatePanel, list: scheduleListPanel },
      {
        dropdownLabel: scheduleSectionDropdownLabel,
        dropdownTrigger: scheduleSectionDropdownTrigger,
        dropdownNav: scheduleSectionNav,
        createLabel: 'Create Schedule',
        listLabel: 'Schedule List',
      }
    );
  });
}

if (shareScheduleLinkBtn) {
  shareScheduleLinkBtn.addEventListener('click', async () => {
    const shareUrl = new URL('/schedule/create', window.location.origin).toString();

    setButtonLoading(shareScheduleLinkBtn, true, 'Copying share link');
    if (shareScheduleLinkFeedback) {
      shareScheduleLinkFeedback.textContent = 'Preparing share link...';
      shareScheduleLinkFeedback.style.color = '#5d645d';
    }

    try {
      await syncScheduleShareLinkToBuiltInSettings(shareUrl);
      await copyTextToClipboard(shareUrl);
      if (shareScheduleLinkFeedback) {
        shareScheduleLinkFeedback.textContent = `Share link copied: ${shareUrl}`;
        shareScheduleLinkFeedback.style.color = '#136f63';
      }
    } catch (error) {
      if (shareScheduleLinkFeedback) {
        shareScheduleLinkFeedback.textContent = `Share link: ${shareUrl}`;
        shareScheduleLinkFeedback.style.color = '#9f4f03';
      }
    } finally {
      setButtonLoading(shareScheduleLinkBtn, false);
    }
  });
}

if (commandTabCreate) {
  commandTabCreate.addEventListener('click', () => {
    setTabbedPanel(
      'create',
      { create: commandTabCreate, list: commandTabList },
      { create: commandCreatePanel, list: commandListPanel },
      {
        dropdownLabel: commandSectionDropdownLabel,
        dropdownTrigger: commandSectionDropdownTrigger,
        dropdownNav: commandSectionNav,
        createLabel: 'Add Command',
        listLabel: 'Command List',
      }
    );
  });
}

if (commandTabList) {
  commandTabList.addEventListener('click', () => {
    setTabbedPanel(
      'list',
      { create: commandTabCreate, list: commandTabList },
      { create: commandCreatePanel, list: commandListPanel },
      {
        dropdownLabel: commandSectionDropdownLabel,
        dropdownTrigger: commandSectionDropdownTrigger,
        dropdownNav: commandSectionNav,
        createLabel: 'Add Command',
        listLabel: 'Command List',
      }
    );
  });
}

if (scheduleSectionDropdownTrigger && scheduleSectionNav) {
  scheduleSectionDropdownTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = scheduleSectionNav.classList.contains('open');
    scheduleSectionNav.classList.toggle('open', !isOpen);
    scheduleSectionDropdownTrigger.setAttribute('aria-expanded', String(!isOpen));
  });

  document.addEventListener('click', (event) => {
    if (!scheduleSectionNav.classList.contains('open')) return;
    if (scheduleSectionNav.contains(event.target) || scheduleSectionDropdownTrigger.contains(event.target)) return;
    scheduleSectionNav.classList.remove('open');
    scheduleSectionDropdownTrigger.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      scheduleSectionNav.classList.remove('open');
      scheduleSectionDropdownTrigger.setAttribute('aria-expanded', 'false');
    }
  });
}

if (commandSectionDropdownTrigger && commandSectionNav) {
  commandSectionDropdownTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = commandSectionNav.classList.contains('open');
    commandSectionNav.classList.toggle('open', !isOpen);
    commandSectionDropdownTrigger.setAttribute('aria-expanded', String(!isOpen));
  });

  document.addEventListener('click', (event) => {
    if (!commandSectionNav.classList.contains('open')) return;
    if (commandSectionNav.contains(event.target) || commandSectionDropdownTrigger.contains(event.target)) return;
    commandSectionNav.classList.remove('open');
    commandSectionDropdownTrigger.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      commandSectionNav.classList.remove('open');
      commandSectionDropdownTrigger.setAttribute('aria-expanded', 'false');
    }
  });
}

setTabbedPanel(
  'create',
  { create: scheduleTabCreate, list: scheduleTabList },
  { create: scheduleCreatePanel, list: scheduleListPanel },
  {
    dropdownLabel: scheduleSectionDropdownLabel,
    dropdownTrigger: scheduleSectionDropdownTrigger,
    dropdownNav: scheduleSectionNav,
    createLabel: 'Create Schedule',
    listLabel: 'Schedule List',
  }
);
setTabbedPanel(
  'create',
  { create: commandTabCreate, list: commandTabList },
  { create: commandCreatePanel, list: commandListPanel },
  {
    dropdownLabel: commandSectionDropdownLabel,
    dropdownTrigger: commandSectionDropdownTrigger,
    dropdownNav: commandSectionNav,
    createLabel: 'Add Command',
    listLabel: 'Command List',
  }
);

if (pairingPhoneInput) {
  pairingPhoneInput.addEventListener('input', () => {
    const rawValue = String(pairingPhoneInput.value || '');
    const digitsOnly = rawValue.replace(/\D+/g, '');
    const normalized = rawValue.startsWith('+') ? `+${digitsOnly}` : digitsOnly;
    if (pairingPhoneInput.value !== normalized) {
      pairingPhoneInput.value = normalized;
    }

    if (pairingCodeWrap) pairingCodeWrap.hidden = true;
    schedulePairingPhoneValidation();
  });
}

if (requestPairingBtn) {
  requestPairingBtn.addEventListener('click', async () => {
    if (isWhatsAppReady) {
      if (pairingFeedback) {
        pairingFeedback.textContent = 'Pairing via phone number is disabled while WhatsApp is connected.';
        pairingFeedback.style.color = '#b42318';
      }
      return;
    }

    const phoneNumber = getNormalizedPairingPhoneValue();
    if (pairingPhoneInput) {
      pairingPhoneInput.value = phoneNumber;
    }
    if (!phoneNumber) {
      if (pairingFeedback) {
        pairingFeedback.textContent = 'Please enter a phone number';
        pairingFeedback.style.color = '#b42318';
      }
      return;
    }

    setButtonLoading(requestPairingBtn, true, 'Requesting pairing code');
    if (pairingFeedback) {
      pairingFeedback.textContent = 'Requesting pairing code...';
      pairingFeedback.style.color = '#5d645d';
    }
    if (pairingCodeWrap) pairingCodeWrap.hidden = true;

    try {
      const validationResult = await validatePairingPhoneNumber(phoneNumber, { force: true, showPending: false });
      if (!validationResult.ok && !validationResult.stale) {
        throw new Error(validationResult.error || 'Phone number validation failed');
      }

      const response = await fetch('/api/whatsapp/pairing-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request pairing code');
      }

      if (pairingCodeValue && pairingCodeWrap) {
        pairingCodeValue.textContent = data.code || '';
        pairingCodeWrap.hidden = false;
      }
      if (pairingFeedback) {
        pairingFeedback.textContent = 'Pairing code generated, enter it in WhatsApp.';
        pairingFeedback.style.color = '#136f63';
      }
    } catch (error) {
      if (pairingFeedback) {
        pairingFeedback.textContent = error.message;
        pairingFeedback.style.color = '#b42318';
      }
    } finally {
      setButtonLoading(requestPairingBtn, false);
      updatePairingRequestButtonState();
    }
  });
}

if (refreshQrBtn) {
  refreshQrBtn.addEventListener('click', async () => {
    await performQrRefresh({ silent: false, fromAuto: false });
  });
}

async function refreshWhatsAppState() {
  if (!waStatus) return;

  try {
    const response = await fetch('/api/whatsapp/state');
    if (!response.ok) {
      throw new Error('Failed to fetch WhatsApp state');
    }

    const state = await response.json();
    renderWhatsAppState(state);
  } catch (error) {
    waStatus.textContent = 'Unable to refresh WhatsApp status';
    waStatus.classList.remove('status-ok');
    waStatus.classList.add('status-warn');
  }
}

function setGroupHint(text, color = '#5d645d') {
  if (!targetHint) return;
  targetHint.textContent = text;
  targetHint.style.color = color;
}

function setSendGroupHint(text, color = '#5d645d') {
  if (!sendTargetHint) return;
  sendTargetHint.textContent = text;
  sendTargetHint.style.color = color;
}

function setPersonalChatHint(text, color = '#5d645d') {
  if (!targetHint) return;
  targetHint.textContent = text;
  targetHint.style.color = color;
}

function setSendPersonalChatHint(text, color = '#5d645d') {
  if (!sendTargetHint) return;
  sendTargetHint.textContent = text;
  sendTargetHint.style.color = color;
}

const targetGroupSuggestionMap = new Map();
const targetPersonalSuggestionMap = new Map();
const sendTargetGroupSuggestionMap = new Map();
const sendTargetPersonalSuggestionMap = new Map();

function fillTargetSuggestions(datalistEl, map, items) {
  map.clear();
  if (!datalistEl) return;

  const optionHtml = items
    .map(({ id, label }) => {
      const display = `${label} - ${id}`;
      map.set(display, id);
      const safeDisplay = display.replace(/"/g, '&quot;');
      return `<option value="${safeDisplay}"></option>`;
    })
    .join('');

  datalistEl.innerHTML = optionHtml;
}

function setGroupPickerOptions(groups) {
  fillTargetSuggestions(
    targetValueGroupSuggestions,
    targetGroupSuggestionMap,
    groups.map((group) => ({ id: String(group.id || ''), label: String(group.name || 'Untitled') }))
  );
}

function setSendGroupPickerOptions(groups) {
  fillTargetSuggestions(
    sendTargetValueGroupSuggestions,
    sendTargetGroupSuggestionMap,
    groups.map((group) => ({ id: String(group.id || ''), label: String(group.name || 'Untitled') }))
  );
}

function setPersonalChatPickerOptions(chats) {
  fillTargetSuggestions(
    targetValuePersonalSuggestions,
    targetPersonalSuggestionMap,
    chats.map((chat) => {
      const safeName = String(chat.name || chat.phone || 'Unnamed');
      return { id: String(chat.id || ''), label: safeName };
    })
  );
}

function setSendPersonalChatPickerOptions(chats) {
  fillTargetSuggestions(
    sendTargetValuePersonalSuggestions,
    sendTargetPersonalSuggestionMap,
    chats.map((chat) => {
      const safeName = String(chat.name || chat.phone || 'Unnamed');
      return { id: String(chat.id || ''), label: safeName };
    })
  );
}

async function loadPersonalChats(force = false) {
  if (!targetValuePersonalSuggestions) return;
  if (hasLoadedPersonalChats && !force) return;

  if (scheduleRefreshBtn) setRefreshButtonLoading(scheduleRefreshBtn, true);
  setPersonalChatHint('Fetching personal chat list...', '#5d645d');

  try {
    const response = await fetch('/api/whatsapp/personal-chats');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch personal chats');
    }

    const chats = Array.isArray(data.chats) ? data.chats : [];
    setPersonalChatPickerOptions(chats);
    hasLoadedPersonalChats = true;

    if (chats.length) {
      setPersonalChatHint('Type an ID, or pick a suggestion below to auto-fill it.', '#5d645d');
    } else {
      setPersonalChatHint('No personal chats found on this account. Type the ID manually.', '#9f4f03');
    }
  } catch (error) {
    setPersonalChatPickerOptions([]);
    setPersonalChatHint(error.message, '#b42318');
  } finally {
    if (scheduleRefreshBtn) {
      setRefreshButtonLoading(scheduleRefreshBtn, false);
    }
  }
}

async function loadSendPersonalChats(force = false) {
  if (!sendTargetValuePersonalSuggestions) return;
  if (hasLoadedSendPersonalChats && !force) return;

  if (sendRefreshBtn) {
    setRefreshButtonLoading(sendRefreshBtn, true);
  }
  setSendPersonalChatHint('Fetching personal chat list...', '#5d645d');

  try {
    const response = await fetch('/api/whatsapp/personal-chats');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch personal chats');
    }

    const chats = Array.isArray(data.chats) ? data.chats : [];
    setSendPersonalChatPickerOptions(chats);
    hasLoadedSendPersonalChats = true;

    if (chats.length) {
      setSendPersonalChatHint('Type an ID, or pick a suggestion below to auto-fill it.', '#5d645d');
    } else {
      setSendPersonalChatHint('No personal chats found on this account. Type the ID manually.', '#9f4f03');
    }
  } catch (error) {
    setSendPersonalChatPickerOptions([]);
    setSendPersonalChatHint(error.message, '#b42318');
  } finally {
    if (sendRefreshBtn) {
      setRefreshButtonLoading(sendRefreshBtn, false);
    }
  }
}

async function loadGroups(force = false) {
  if (!targetValueGroupSuggestions) return;
  if (hasLoadedGroups && !force) return;

  if (scheduleRefreshBtn) setRefreshButtonLoading(scheduleRefreshBtn, true);
  setGroupHint('Fetching group list...', '#5d645d');

  try {
    const response = await fetch('/api/whatsapp/groups');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch group list');
    }

    const groups = Array.isArray(data.groups) ? data.groups : [];
    setGroupPickerOptions(groups);
    hasLoadedGroups = true;

    if (groups.length) {
      setGroupHint('Type an ID, or pick a suggestion below to auto-fill it.', '#5d645d');
    } else {
      setGroupHint('No groups found on this account. Type the group ID manually.', '#9f4f03');
    }
  } catch (error) {
    setGroupPickerOptions([]);
    setGroupHint(error.message, '#b42318');
  } finally {
    if (scheduleRefreshBtn) {
      setRefreshButtonLoading(scheduleRefreshBtn, false);
    }
  }
}

async function loadSendGroups(force = false) {
  if (!sendTargetValueGroupSuggestions) return;
  if (hasLoadedSendGroups && !force) return;

  if (sendRefreshBtn) setRefreshButtonLoading(sendRefreshBtn, true);
  setSendGroupHint('Fetching group list...', '#5d645d');

  try {
    const response = await fetch('/api/whatsapp/groups');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch group list');
    }

    const groups = Array.isArray(data.groups) ? data.groups : [];
    setSendGroupPickerOptions(groups);
    hasLoadedSendGroups = true;

    if (groups.length) {
      setSendGroupHint('Type an ID, or pick a suggestion below to auto-fill it.', '#5d645d');
    } else {
      setSendGroupHint('No groups found on this account. Type the group ID manually.', '#9f4f03');
    }
  } catch (error) {
    setSendGroupPickerOptions([]);
    setSendGroupHint(error.message, '#b42318');
  } finally {
    if (sendRefreshBtn) {
      setRefreshButtonLoading(sendRefreshBtn, false);
    }
  }
}

function normalizeTargetValueInput(inputEl, isGroupTypeFn, groupMap, personalMap) {
  if (!inputEl) return;
  const map = isGroupTypeFn() ? groupMap : personalMap;
  const current = inputEl.value;
  if (map.has(current)) {
    inputEl.value = map.get(current);
  }
}

function syncTargetInputContent() {
  if (!targetTypeInput || !targetValueLabel || !targetHint || !targetValueField) return;

  if (scheduleTargetStep?.hidden) {
    return;
  }

  if (targetTypeInput.value === 'group') {
    targetValueField.hidden = false;
    targetValueLabel.textContent = 'Group ID (example: 1203630xxxx@g.us)';
    targetHint.textContent = 'You can enter 1203630xxxx only or with @g.us suffix';
    if (targetValueInput) targetValueInput.setAttribute('list', 'targetValueGroupSuggestions');
    if (scheduleRefreshBtn) scheduleRefreshBtn.textContent = 'Refresh Groups';
    loadGroups();
    return;
  }

  targetValueField.hidden = false;
  targetValueLabel.textContent = 'Personal ID / Number (example: 62812xxxx@s.whatsapp.net)';
  targetHint.textContent = 'You can enter phone number only or with @s.whatsapp.net suffix';
  if (targetValueInput) targetValueInput.setAttribute('list', 'targetValuePersonalSuggestions');
  if (scheduleRefreshBtn) scheduleRefreshBtn.textContent = 'Refresh Chats';
  loadPersonalChats();
}

function syncSendTargetInputContent() {
  if (!sendTargetTypeInput || !sendTargetValueLabel || !sendTargetHint || !sendTargetValueField) return;

  if (sendTargetTypeInput.value === 'group') {
    sendTargetValueField.hidden = false;
    sendTargetValueLabel.textContent = 'Group ID (example: 1203630xxxx@g.us)';
    sendTargetHint.textContent = 'You can enter 1203630xxxx only or with @g.us suffix';
    if (sendTargetValueInput) sendTargetValueInput.setAttribute('list', 'sendTargetValueGroupSuggestions');
    if (sendRefreshBtn) sendRefreshBtn.textContent = 'Refresh Groups';
    updateSendTargetClearButtonState();
    loadSendGroups();
    return;
  }

  sendTargetValueField.hidden = false;
  sendTargetValueLabel.textContent = 'Personal ID / Number (example: 62812xxxx@s.whatsapp.net)';
  sendTargetHint.textContent = 'You can enter phone number only or with @s.whatsapp.net suffix';
  if (sendTargetValueInput) sendTargetValueInput.setAttribute('list', 'sendTargetValuePersonalSuggestions');
  if (sendRefreshBtn) sendRefreshBtn.textContent = 'Refresh Chats';
  loadSendPersonalChats();
  updateSendTargetClearButtonState();
}

if (targetTypeInput) {
  targetTypeInput.addEventListener('change', syncTargetInputContent);
  syncTargetInputContent();
}

if (sendTargetTypeInput) {
  sendTargetTypeInput.addEventListener('change', syncSendTargetInputContent);
  syncSendTargetInputContent();
}

if (sidebarMenuBtn) {
  sidebarMenuBtn.addEventListener('click', openSidebar);
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', closeSidebar);
}

if (navItems.length) {
  navItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      const hash = item.getAttribute('href') || '';
      window.history.pushState(null, '', hash);
      showPageByHash(hash);
      closeSidebar();
    });
  });

  showPageByHash(window.location.hash || DEFAULT_PAGE_HASH);
  document.documentElement.classList.remove('has-route-hash');
  window.addEventListener('hashchange', () => {
    showPageByHash(window.location.hash || DEFAULT_PAGE_HASH);
  });
  window.addEventListener('popstate', () => {
    showPageByHash(window.location.hash || DEFAULT_PAGE_HASH);
  });
}

if (targetValueInput) {
  targetValueInput.addEventListener('input', () => {
    normalizeTargetValueInput(
      targetValueInput,
      () => !targetTypeInput || targetTypeInput.value === 'group',
      targetGroupSuggestionMap,
      targetPersonalSuggestionMap
    );
  });
}

if (sendTargetValueInput) {
  sendTargetValueInput.addEventListener('input', () => {
    normalizeTargetValueInput(
      sendTargetValueInput,
      () => !sendTargetTypeInput || sendTargetTypeInput.value === 'group',
      sendTargetGroupSuggestionMap,
      sendTargetPersonalSuggestionMap
    );
    updateSendTargetClearButtonState();
  });
}

if (sendTargetClearBtn) {
  sendTargetClearBtn.addEventListener('click', () => {
    if (sendTargetValueInput) {
      sendTargetValueInput.value = '';
      sendTargetValueInput.focus();
    }
    updateSendTargetClearButtonState();
  });
}

if (scheduleRefreshBtn) {
  scheduleRefreshBtn.addEventListener('click', () => {
    if (targetTypeInput?.value === 'group') {
      loadGroups(true);
    } else {
      loadPersonalChats(true);
    }
  });
}

if (sendRefreshBtn) {
  sendRefreshBtn.addEventListener('click', () => {
    if (sendTargetTypeInput?.value === 'group') {
      loadSendGroups(true);
    } else {
      loadSendPersonalChats(true);
    }
  });
}

if (scheduleSelectChatBtn) {
  scheduleSelectChatBtn.addEventListener('click', () => {
    openChatSelectorModal({
      targetTypeSelect: targetTypeInput,
      targetTypeInput: targetTypeInput,
      targetValueInput: targetValueInput
    });
  });
}

if (sendSelectChatBtn) {
  sendSelectChatBtn.addEventListener('click', () => {
    openChatSelectorModal({
      targetTypeSelect: sendTargetTypeInput,
      targetTypeInput: null,
      targetValueInput: sendTargetValueInput
    });
  });
}

if (closeChatSelectorModal) {
  closeChatSelectorModal.addEventListener('click', closeChatSelectorModalFn);
}

if (chatSelectorModal) {
  const backdrop = chatSelectorModal.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeChatSelectorModalFn);
  }
}

if (sendMediaTypeInput) {
  sendMediaTypeInput.addEventListener('change', updateSendMediaFlow);
}

if (sendMediaSourceTabs.length) {
  sendMediaSourceTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const selectedSource = normalizeMediaSourceValue(tab.dataset.sendMediaSource || 'url');
      setSendMediaSource(selectedSource);
    });
  });
}

updateSendMediaFlow();

if (routeListEditModeBtn) {
  routeListEditModeBtn.addEventListener('click', () => {
    setRouteListEditMode(!isRouteListEditMode);
  });
}

if (routeListSearchInput) {
  routeListSearchInput.addEventListener('input', applyRouteListFilters);
}

if (routeListMethodFilter) {
  routeListMethodFilter.addEventListener('change', applyRouteListFilters);
}

if (routeListTableBody) {
  routeListTableBody.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.matches('[data-route-visibility], [data-route-enabled]')) {
      updateRouteListOverview();
    }
  });

  setRouteListEditMode(false);
  applyRouteListFilters();
}

if (vendingRouteTableBody || vendingLocationTableBody || vendingRouteLocationTableBody) {
  loadVendingData().catch((error) => {
    setVendingFeedback(vendingRouteFeedback, error.message, '#b42318');
    setVendingFeedback(vendingLocationFeedback, error.message, '#b42318');
    setVendingFeedback(vendingRouteLocationFeedback, error.message, '#b42318');
  });
}

if (vendingRouteAddRowBtn) {
  vendingRouteAddRowBtn.addEventListener('click', () => {
    vendingRouteInlineMode = 'add';
    vendingRouteInlineEditId = '';
    setVendingFeedback(vendingRouteFeedback, 'Add mode active. Fill row and click Save.');
    renderVendingRoutesTable();
  });
}

if (vendingRouteTableBody) {
  vendingRouteTableBody.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const cancelInlineBtn = target.closest('[data-vending-route-cancel-inline]');
    if (cancelInlineBtn) {
      resetVendingRouteInlineState();
      setVendingFeedback(vendingRouteFeedback, '');
      renderVendingRoutesTable();
      return;
    }

    const saveCreateBtn = target.closest('[data-vending-route-save-create]');
    if (saveCreateBtn) {
      const row = saveCreateBtn.closest('tr');
      const idInput = row?.querySelector('[data-vending-route-input-id]');
      const codeInput = row?.querySelector('[data-vending-route-input-code]');
      const nameInput = row?.querySelector('[data-vending-route-input-name]');
      const descriptionInput = row?.querySelector('[data-vending-route-input-description]');
      const payload = {
        id: String(idInput?.value || '').trim(),
        code: String(codeInput?.value || '').trim(),
        name: String(nameInput?.value || '').trim(),
        description: String(descriptionInput?.value || '').trim(),
      };

      if (!payload.id || !payload.code || !payload.name) {
        setVendingFeedback(vendingRouteFeedback, 'Id, code and name are required.', '#b42318');
        return;
      }

      setVendingFeedback(vendingRouteFeedback, 'Saving route...');
      try {
        await requestJson('/api/vending/routes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        resetVendingRouteInlineState();
        await loadVendingData();
        setVendingFeedback(vendingRouteFeedback, 'Route saved.', '#136f63');
      } catch (error) {
        setVendingFeedback(vendingRouteFeedback, error.message, '#b42318');
      }
      return;
    }

    const saveEditBtn = target.closest('[data-vending-route-save-edit]');
    if (saveEditBtn) {
      const id = String(saveEditBtn.getAttribute('data-vending-route-save-edit') || '').trim();
      const row = saveEditBtn.closest('tr');
      const codeInput = row?.querySelector('[data-vending-route-input-code]');
      const nameInput = row?.querySelector('[data-vending-route-input-name]');
      const descriptionInput = row?.querySelector('[data-vending-route-input-description]');
      const payload = {
        code: String(codeInput?.value || '').trim(),
        name: String(nameInput?.value || '').trim(),
        description: String(descriptionInput?.value || '').trim(),
      };

      if (!payload.code || !payload.name) {
        setVendingFeedback(vendingRouteFeedback, 'Code and name are required.', '#b42318');
        return;
      }

      setVendingFeedback(vendingRouteFeedback, 'Saving route...');
      try {
        await requestJson(`/api/vending/routes/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        resetVendingRouteInlineState();
        await loadVendingData();
        setVendingFeedback(vendingRouteFeedback, 'Route saved.', '#136f63');
      } catch (error) {
        setVendingFeedback(vendingRouteFeedback, error.message, '#b42318');
      }
      return;
    }

    const editBtn = target.closest('[data-vending-route-edit]');
    if (editBtn) {
      const id = String(editBtn.getAttribute('data-vending-route-edit') || '').trim();
      const item = vendingRoutes.find((row) => String(row.id) === id);
      if (!item) return;
      vendingRouteInlineMode = 'edit';
      vendingRouteInlineEditId = String(item.id);
      setVendingFeedback(vendingRouteFeedback, 'Edit mode active. Update row and click Save.');
      renderVendingRoutesTable();
      return;
    }

    const deleteBtn = target.closest('[data-vending-route-delete]');
    if (deleteBtn) {
      const id = String(deleteBtn.getAttribute('data-vending-route-delete') || '').trim();
      const confirmDelete = window.confirm('Delete this route?');
      if (!confirmDelete) return;

      try {
        await requestJson(`/api/vending/routes/${encodeURIComponent(id)}`, { method: 'DELETE' });
        resetVendingRouteInlineState();
        await loadVendingData();
        setVendingFeedback(vendingRouteFeedback, 'Route deleted.', '#136f63');
      } catch (error) {
        setVendingFeedback(vendingRouteFeedback, error.message, '#b42318');
      }
    }
  });
}

if (vendingLocationAddRowBtn) {
  vendingLocationAddRowBtn.addEventListener('click', () => {
    vendingLocationInlineMode = 'add';
    vendingLocationInlineEditId = '';
    setVendingFeedback(vendingLocationFeedback, 'Add mode active. Fill row and click Save.');
    renderVendingLocationsTable();
  });
}

if (vendingLocationTableBody) {
  vendingLocationTableBody.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const cancelInlineBtn = target.closest('[data-vending-location-cancel-inline]');
    if (cancelInlineBtn) {
      resetVendingLocationInlineState();
      setVendingFeedback(vendingLocationFeedback, '');
      renderVendingLocationsTable();
      return;
    }

    const saveCreateBtn = target.closest('[data-vending-location-save-create]');
    if (saveCreateBtn) {
      const row = saveCreateBtn.closest('tr');
      const idInput = row?.querySelector('[data-vending-location-input-id]');
      const nameInput = row?.querySelector('[data-vending-location-input-name]');
      const deliveryInput = row?.querySelector('[data-vending-location-input-delivery]');
      const payload = {
        id: String(idInput?.value || '').trim(),
        name: String(nameInput?.value || '').trim(),
        address: String(deliveryInput?.value || '').trim(),
        notes: '',
      };

      if (!payload.id || !payload.name) {
        setVendingFeedback(vendingLocationFeedback, 'Id and name are required.', '#b42318');
        return;
      }

      setVendingFeedback(vendingLocationFeedback, 'Saving location...');
      try {
        await requestJson('/api/vending/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        resetVendingLocationInlineState();
        await loadVendingData();
        setVendingFeedback(vendingLocationFeedback, 'Location saved.', '#136f63');
      } catch (error) {
        setVendingFeedback(vendingLocationFeedback, error.message, '#b42318');
      }
      return;
    }

    const saveEditBtn = target.closest('[data-vending-location-save-edit]');
    if (saveEditBtn) {
      const id = String(saveEditBtn.getAttribute('data-vending-location-save-edit') || '').trim();
      const row = saveEditBtn.closest('tr');
      const nameInput = row?.querySelector('[data-vending-location-input-name]');
      const deliveryInput = row?.querySelector('[data-vending-location-input-delivery]');
      const payload = {
        name: String(nameInput?.value || '').trim(),
        address: String(deliveryInput?.value || '').trim(),
        notes: '',
      };

      if (!payload.name) {
        setVendingFeedback(vendingLocationFeedback, 'Name is required.', '#b42318');
        return;
      }

      setVendingFeedback(vendingLocationFeedback, 'Saving location...');
      try {
        await requestJson(`/api/vending/locations/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        resetVendingLocationInlineState();
        await loadVendingData();
        setVendingFeedback(vendingLocationFeedback, 'Location saved.', '#136f63');
      } catch (error) {
        setVendingFeedback(vendingLocationFeedback, error.message, '#b42318');
      }
      return;
    }

    const editBtn = target.closest('[data-vending-location-edit]');
    if (editBtn) {
      const id = String(editBtn.getAttribute('data-vending-location-edit') || '').trim();
      const item = vendingLocations.find((row) => String(row.id) === id);
      if (!item) return;
      vendingLocationInlineMode = 'edit';
      vendingLocationInlineEditId = String(item.id);
      setVendingFeedback(vendingLocationFeedback, 'Edit mode active. Update row and click Save.');
      renderVendingLocationsTable();
      return;
    }

    const deleteBtn = target.closest('[data-vending-location-delete]');
    if (deleteBtn) {
      const id = String(deleteBtn.getAttribute('data-vending-location-delete') || '').trim();
      const confirmDelete = window.confirm('Delete this location?');
      if (!confirmDelete) return;

      try {
        await requestJson(`/api/vending/locations/${encodeURIComponent(id)}`, { method: 'DELETE' });
        resetVendingLocationInlineState();
        await loadVendingData();
        setVendingFeedback(vendingLocationFeedback, 'Location deleted.', '#136f63');
      } catch (error) {
        setVendingFeedback(vendingLocationFeedback, error.message, '#b42318');
      }
    }
  });
}

if (vendingRouteLocationAddRowBtn) {
  vendingRouteLocationAddRowBtn.addEventListener('click', () => {
    vendingRouteLocationInlineMode = 'add';
    vendingRouteLocationInlineEditId = '';
    setVendingFeedback(vendingRouteLocationFeedback, 'Add mode active. Fill row and click Save.');
    renderVendingRouteLocationsTable();
  });
}

if (vendingRouteLocationTableBody) {
  vendingRouteLocationTableBody.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const cancelInlineBtn = target.closest('[data-vending-route-location-cancel-inline]');
    if (cancelInlineBtn) {
      resetVendingRouteLocationInlineState();
      setVendingFeedback(vendingRouteLocationFeedback, '');
      renderVendingRouteLocationsTable();
      return;
    }

    const saveCreateBtn = target.closest('[data-vending-route-location-save-create]');
    if (saveCreateBtn) {
      const row = saveCreateBtn.closest('tr');
      const idInput = row?.querySelector('[data-vending-route-location-input-id]');
      const routeIdInput = row?.querySelector('[data-vending-route-location-input-route-id]');
      const locationIdInput = row?.querySelector('[data-vending-route-location-input-location-id]');
      const sequenceInput = row?.querySelector('[data-vending-route-location-input-sequence]');
      const statusInput = row?.querySelector('[data-vending-route-location-input-status]');
      const payload = {
        id: String(idInput?.value || '').trim(),
        routeId: String(routeIdInput?.value || '').trim(),
        locationId: String(locationIdInput?.value || '').trim(),
        sequence: Number(sequenceInput?.value || 1),
        status: String(statusInput?.value || 'active').trim(),
      };

      if (!payload.id || !payload.routeId || !payload.locationId) {
        setVendingFeedback(vendingRouteLocationFeedback, 'Id, route id and location id are required.', '#b42318');
        return;
      }

      setVendingFeedback(vendingRouteLocationFeedback, 'Saving route location...');
      try {
        await requestJson('/api/vending/route-locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        resetVendingRouteLocationInlineState();
        await loadVendingData();
        setVendingFeedback(vendingRouteLocationFeedback, 'Route location saved.', '#136f63');
      } catch (error) {
        setVendingFeedback(vendingRouteLocationFeedback, error.message, '#b42318');
      }
      return;
    }

    const saveEditBtn = target.closest('[data-vending-route-location-save-edit]');
    if (saveEditBtn) {
      const id = String(saveEditBtn.getAttribute('data-vending-route-location-save-edit') || '').trim();
      const row = saveEditBtn.closest('tr');
      const routeIdInput = row?.querySelector('[data-vending-route-location-input-route-id]');
      const locationIdInput = row?.querySelector('[data-vending-route-location-input-location-id]');
      const sequenceInput = row?.querySelector('[data-vending-route-location-input-sequence]');
      const statusInput = row?.querySelector('[data-vending-route-location-input-status]');
      const payload = {
        routeId: String(routeIdInput?.value || '').trim(),
        locationId: String(locationIdInput?.value || '').trim(),
        sequence: Number(sequenceInput?.value || 1),
        status: String(statusInput?.value || 'active').trim(),
      };

      if (!payload.routeId || !payload.locationId) {
        setVendingFeedback(vendingRouteLocationFeedback, 'Route id and location id are required.', '#b42318');
        return;
      }

      setVendingFeedback(vendingRouteLocationFeedback, 'Saving route location...');
      try {
        await requestJson(`/api/vending/route-locations/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        resetVendingRouteLocationInlineState();
        await loadVendingData();
        setVendingFeedback(vendingRouteLocationFeedback, 'Route location saved.', '#136f63');
      } catch (error) {
        setVendingFeedback(vendingRouteLocationFeedback, error.message, '#b42318');
      }
      return;
    }

    const editBtn = target.closest('[data-vending-route-location-edit]');
    if (editBtn) {
      const id = String(editBtn.getAttribute('data-vending-route-location-edit') || '').trim();
      const item = vendingRouteLocations.find((row) => String(row.id) === id);
      if (!item) return;
      vendingRouteLocationInlineMode = 'edit';
      vendingRouteLocationInlineEditId = String(item.id);
      setVendingFeedback(vendingRouteLocationFeedback, 'Edit mode active. Update row and click Save.');
      renderVendingRouteLocationsTable();
      return;
    }

    const deleteBtn = target.closest('[data-vending-route-location-delete]');
    if (deleteBtn) {
      const id = String(deleteBtn.getAttribute('data-vending-route-location-delete') || '').trim();
      const confirmDelete = window.confirm('Delete this route location mapping?');
      if (!confirmDelete) return;

      try {
        await requestJson(`/api/vending/route-locations/${encodeURIComponent(id)}`, { method: 'DELETE' });
        resetVendingRouteLocationInlineState();
        await loadVendingData();
        setVendingFeedback(vendingRouteLocationFeedback, 'Route location deleted.', '#136f63');
      } catch (error) {
        setVendingFeedback(vendingRouteLocationFeedback, error.message, '#b42318');
      }
    }
  });
}

refreshWhatsAppState();
window.setInterval(refreshWhatsAppState, 5000);

if (toggleBotResponsePersonal || toggleBotResponseGroup || toggleBotResponseSelfCommand) {
  loadChatResponseSettings();
}

if (ownerNumberInput || commandModeSelect) {
  loadAccessControlSettings();
}

hydrateScheduleTimesToLocal();

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');

    const formData = new FormData(form);
    const selectedType = String(formData.get('targetType') || '').trim();
    const targetValueRaw = String(formData.get('targetValue') || '').trim();
    const repeatType = String(formData.get('repeatType') || 'none').trim();
    const repeatDays = formData
      .getAll('repeatDays')
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value));

    const selectedMediaType = String(formData.get('mediaType') || 'none').trim();
    const selectedMediaSource = String(formData.get('mediaSource') || 'url').trim();
    let mediaUrl = String(formData.get('mediaUrl') || '').trim();
    let fileName = String(formData.get('fileName') || '').trim();

    if (repeatType === 'weekly' && !repeatDays.length) {
      feedback.textContent = 'Select at least one day for a weekly repeat schedule.';
      feedback.style.color = '#b42318';
      return;
    }

    const rawScheduleAt = String(formData.get('scheduleAt') || '').trim();
    const normalizedScheduleAt = normalizeScheduleAtValue(repeatType, rawScheduleAt);

    const payload = {
      targetType: selectedType,
      targetValue: targetValueRaw,
      message: String(formData.get('message') || '').trim(),
      scheduleAt: normalizedScheduleAt,
      timezoneOffsetMinutes: getTimezoneOffsetMinutesForSchedule(
        normalizedScheduleAt,
        getSelectedTimeZone()
      ),
      repeatType,
      repeatDays,
      mediaType: selectedMediaType,
      buttons: collectButtonsFromRows(scheduleButtonRows),
    };

    if (!payload.targetValue) {
      feedback.textContent = 'Target value is required.';
      feedback.style.color = '#b42318';
      return;
    }

    feedback.textContent = 'Saving schedule...';
    feedback.style.color = '#5d645d';
    setButtonLoading(submitBtn, true, 'Saving schedule');

    try {
      if (selectedMediaType && selectedMediaType !== 'none' && selectedMediaSource === 'upload') {
        const selectedFile = scheduleMediaUploadInput?.files?.[0];
        if (selectedFile) {
          feedback.textContent = 'Uploading media file...';
          const uploaded = await uploadScheduleMediaFile(selectedFile, selectedMediaType);
          mediaUrl = String(uploaded.mediaUrl || '').trim();
          if (!fileName) {
            fileName = String(uploaded.fileName || '').trim();
          }
        }
      }

      payload.mediaUrl = mediaUrl;
      payload.fileName = fileName;

      if (selectedMediaType && selectedMediaType !== 'none' && !mediaUrl) {
        throw new Error('Provide a media URL or upload a file.');
      }

      feedback.textContent = 'Saving schedule...';

      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create schedule');
      }

      feedback.textContent = 'Schedule saved successfully';
      feedback.style.color = '#136f63';
      form.reset();
      if (scheduleButtonRows) {
        scheduleButtonRows.innerHTML = '';
      }
      syncTargetInputContent();
      updateScheduleRepeatFlow();
      updateScheduleFormFlow();
      setTimeout(() => window.location.reload(), 350);
    } catch (error) {
      feedback.textContent = error.message;
      feedback.style.color = '#b42318';
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

if (sendForm) {
  sendForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitBtn = sendForm.querySelector('button[type="submit"]');

    const formData = new FormData(sendForm);
    const selectedMediaType = String(formData.get('mediaType') || 'none').trim();
    const selectedMediaSource = String(formData.get('mediaSource') || 'url').trim();
    let mediaUrl = String(formData.get('mediaUrl') || '').trim();
    let fileName = String(formData.get('fileName') || '').trim();

    const payload = {
      targetType: String(formData.get('targetType') || '').trim(),
      targetValue: String(formData.get('targetValue') || '').trim(),
      message: String(formData.get('message') || '').trim(),
      mediaType: selectedMediaType,
      buttons: collectButtonsFromRows(sendButtonRows),
    };

    const hasMediaAttachment = Boolean(selectedMediaType && selectedMediaType !== 'none');
    const hasMessageText = Boolean(payload.message);
    const hasButtons = Array.isArray(payload.buttons) && payload.buttons.length > 0;

    if (!payload.targetType || !payload.targetValue || (!hasMessageText && !hasMediaAttachment && !hasButtons)) {
      if (sendFeedback) {
        sendFeedback.textContent = 'Target type, target value, and at least one of message, media, or buttons are required.';
        sendFeedback.style.color = '#b42318';
      }
      return;
    }

    if (sendFeedback) {
      sendFeedback.textContent = 'Sending message...';
      sendFeedback.style.color = '#5d645d';
    }
    setButtonLoading(submitBtn, true, 'Sending message');

    try {
      if (hasMediaAttachment && selectedMediaSource === 'upload') {
        const selectedFile = sendMediaUploadInput?.files?.[0];
        if (selectedFile) {
          if (sendFeedback) {
            sendFeedback.textContent = 'Uploading media file...';
          }
          const uploaded = await uploadScheduleMediaFile(selectedFile, selectedMediaType);
          mediaUrl = String(uploaded.mediaUrl || '').trim();
          if (!fileName) {
            fileName = String(uploaded.fileName || '').trim();
          }
        }
      }

      if (hasMediaAttachment && !mediaUrl) {
        throw new Error('Provide a media URL or upload a file.');
      }

      payload.mediaUrl = mediaUrl;
      payload.fileName = fileName;

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      if (sendFeedback) {
        sendFeedback.textContent = 'Message sent successfully';
        sendFeedback.style.color = '#136f63';
      }

      const selectedType = String(sendTargetTypeInput?.value || 'group').trim();
      sendForm.reset();
      if (sendButtonRows) {
        sendButtonRows.innerHTML = '';
      }
      if (sendTargetTypeInput) sendTargetTypeInput.value = selectedType || 'group';
      updateSendMediaFlow();
      syncSendTargetInputContent();
    } catch (error) {
      if (sendFeedback) {
        sendFeedback.textContent = error.message;
        sendFeedback.style.color = '#b42318';
      }
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

const destructiveConfirmModal = document.getElementById('destructiveConfirmModal');
const destructiveConfirmTitle = document.getElementById('destructiveConfirmTitle');
const destructiveConfirmDescription = document.getElementById('destructiveConfirmDescription');
const destructiveConfirmCancelBtn = document.getElementById('destructiveConfirmCancelBtn');
const destructiveConfirmActionBtn = document.getElementById('destructiveConfirmActionBtn');
let destructiveConfirmResolver = null;

function closeDestructiveConfirmModal(confirmed) {
  if (!destructiveConfirmModal) return;
  destructiveConfirmModal.hidden = true;
  syncModalBodyScrollLock();

  if (typeof destructiveConfirmResolver === 'function') {
    const resolver = destructiveConfirmResolver;
    destructiveConfirmResolver = null;
    resolver(Boolean(confirmed));
  }
}

function askDestructiveConfirm(options = {}) {
  const title = String(options.title || 'Delete item?').trim() || 'Delete item?';
  const description = String(options.description || 'This action cannot be undone.').trim() || 'This action cannot be undone.';
  const actionLabel = String(options.actionLabel || 'Delete').trim() || 'Delete';

  if (!destructiveConfirmModal) {
    return Promise.resolve(window.confirm(title));
  }

  if (destructiveConfirmTitle) destructiveConfirmTitle.textContent = title;
  if (destructiveConfirmDescription) destructiveConfirmDescription.textContent = description;
  if (destructiveConfirmActionBtn) destructiveConfirmActionBtn.textContent = actionLabel;

  if (typeof destructiveConfirmResolver === 'function') {
    destructiveConfirmResolver(false);
    destructiveConfirmResolver = null;
  }

  destructiveConfirmModal.hidden = false;
  syncModalBodyScrollLock();

  return new Promise((resolve) => {
    destructiveConfirmResolver = resolve;
  });
}

if (destructiveConfirmModal) {
  destructiveConfirmModal.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.closeModal === 'destructive-confirm') {
      closeDestructiveConfirmModal(false);
    }
  });
}

if (destructiveConfirmCancelBtn) {
  destructiveConfirmCancelBtn.addEventListener('click', () => closeDestructiveConfirmModal(false));
}

if (destructiveConfirmActionBtn) {
  destructiveConfirmActionBtn.addEventListener('click', () => closeDestructiveConfirmModal(true));
}

document.querySelectorAll('.btn-delete').forEach((button) => {
  button.addEventListener('click', async () => {
    const id = button.dataset.id;
    if (!id) return;

    const confirmDelete = await askDestructiveConfirm({
      title: 'Delete schedule?',
      description: 'This will permanently delete this scheduled message from the queue.',
      actionLabel: 'Delete',
    });
    if (!confirmDelete) return;

    setButtonLoading(button, true, 'Deleting schedule');

    try {
      const response = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete schedule');
      }
      window.location.reload();
    } catch (error) {
      window.alert(error.message);
      setButtonLoading(button, false);
    }
  });
});

const scheduleViewModal = document.getElementById('scheduleViewModal');
const closeScheduleViewModalBtn = document.getElementById('closeScheduleViewModal');
const scheduleModalId = document.getElementById('scheduleModalId');
const scheduleModalType = document.getElementById('scheduleModalType');
const scheduleModalTarget = document.getElementById('scheduleModalTarget');
const scheduleModalTime = document.getElementById('scheduleModalTime');
const scheduleModalStatus = document.getElementById('scheduleModalStatus');
const scheduleModalStatusPill = document.getElementById('scheduleModalStatusPill');
const scheduleModalMessage = document.getElementById('scheduleModalMessage');
const scheduleModalRepeat = document.getElementById('scheduleModalRepeat');
const scheduleModalMediaRow = document.getElementById('scheduleModalMediaRow');
const scheduleModalMedia = document.getElementById('scheduleModalMedia');
const scheduleViewModalDescription = document.getElementById('scheduleViewModalDescription');
const scheduleModalFeedback = document.getElementById('scheduleModalFeedback');
const scheduleModalCloseBtn = document.getElementById('scheduleModalCloseBtn');
const scheduleModalDeleteBtn = document.getElementById('scheduleModalDeleteBtn');
let activeScheduleModalId = '';

function closeScheduleViewModal() {
  if (!scheduleViewModal) return;
  activeScheduleModalId = '';
  if (scheduleModalFeedback) {
    scheduleModalFeedback.textContent = '';
    scheduleModalFeedback.style.color = '#5d645d';
  }
  if (scheduleModalDeleteBtn) {
    setButtonLoading(scheduleModalDeleteBtn, false);
    scheduleModalDeleteBtn.disabled = false;
  }
  scheduleViewModal.hidden = true;
  syncModalBodyScrollLock();
}

function openScheduleViewModal(item) {
  if (!scheduleViewModal || !item) return;
  activeScheduleModalId = String(item.id || '').trim();
  const status = String(item.status || '-').trim() || '-';

  if (scheduleModalId) scheduleModalId.textContent = String(item.id || '-');
  if (scheduleModalType) {
    const type = String(item.targetType || '').trim();
    scheduleModalType.textContent = type === 'group' ? 'group' : 'personal';
  }
  if (scheduleModalTarget) scheduleModalTarget.textContent = String(item.targetValue || '-');
  if (scheduleModalTime) {
    const localTime = formatLocalDateTime(item.scheduleAt);
    scheduleModalTime.textContent = localTime || String(item.scheduleAt || '-');
  }
  if (scheduleModalStatus) scheduleModalStatus.textContent = status;
  if (scheduleModalRepeat) {
    const repeatType = String(item.repeatType || 'none').trim();
    if (repeatType === 'daily') {
      scheduleModalRepeat.textContent = 'Every day';
    } else if (repeatType === 'weekly') {
      const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days = Array.isArray(item.repeatDays) ? item.repeatDays.slice().sort() : [];
      scheduleModalRepeat.textContent = days.length
        ? `Weekly on ${days.map((d) => weekdayNames[d]).join(', ')}`
        : 'Weekly';
    } else {
      scheduleModalRepeat.textContent = 'One-time';
    }
  }
  if (scheduleModalMediaRow && scheduleModalMedia) {
    const mediaType = String(item.mediaType || '').trim();
    const mediaUrl = String(item.mediaUrl || '').trim();
    if (mediaType && mediaUrl) {
      scheduleModalMediaRow.hidden = false;
      scheduleModalMedia.innerHTML = `${mediaType} — <a href="${mediaUrl}" target="_blank" rel="noopener">${item.fileName || 'view file'}</a>`;
    } else {
      scheduleModalMediaRow.hidden = true;
      scheduleModalMedia.textContent = '-';
    }
  }
  if (scheduleModalStatusPill) {
    scheduleModalStatusPill.textContent = status;
    scheduleModalStatusPill.classList.remove('badge-outline', 'badge-pending', 'badge-sent', 'badge-failed');
    if (['pending', 'sent', 'failed'].includes(status)) {
      scheduleModalStatusPill.classList.add(`badge-${status}`);
    } else {
      scheduleModalStatusPill.classList.add('badge-outline');
    }
  }
  if (scheduleViewModalDescription) {
    const typeText = String(item.targetType || '').trim() === 'group' ? 'Group' : 'Personal';
    scheduleViewModalDescription.textContent = `ID #${String(item.id || '-')} • ${typeText} schedule`;
  }
  if (scheduleModalMessage) scheduleModalMessage.textContent = String(item.message || '-');
  if (scheduleModalFeedback) {
    scheduleModalFeedback.textContent = '';
    scheduleModalFeedback.style.color = '#5d645d';
  }
  if (scheduleModalDeleteBtn) {
    setButtonLoading(scheduleModalDeleteBtn, false);
    scheduleModalDeleteBtn.disabled = false;
  }

  scheduleViewModal.hidden = false;
  syncModalBodyScrollLock();
}

document.querySelectorAll('.btn-view-schedule').forEach((button) => {
  button.addEventListener('click', () => {
    const id = String(button.dataset.id || '').trim();
    if (!id) return;

    const schedule = schedulesById.get(id);
    if (!schedule) return;

    openScheduleViewModal(schedule);
  });
});

if (scheduleViewModal) {
  scheduleViewModal.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.closeModal === 'schedule-view') {
      closeScheduleViewModal();
    }
  });
}

if (closeScheduleViewModalBtn) {
  closeScheduleViewModalBtn.addEventListener('click', closeScheduleViewModal);
}

if (scheduleModalCloseBtn) {
  scheduleModalCloseBtn.addEventListener('click', closeScheduleViewModal);
}

if (scheduleModalDeleteBtn) {
  scheduleModalDeleteBtn.addEventListener('click', async () => {
    if (!activeScheduleModalId) return;

    const confirmDelete = await askDestructiveConfirm({
      title: 'Delete schedule?',
      description: 'This will permanently delete this scheduled message from the queue.',
      actionLabel: 'Delete',
    });
    if (!confirmDelete) return;

    setButtonLoading(scheduleModalDeleteBtn, true, 'Deleting schedule');
    if (scheduleModalFeedback) {
      scheduleModalFeedback.textContent = 'Deleting schedule...';
      scheduleModalFeedback.style.color = '#5d645d';
    }

    try {
      const response = await fetch(`/api/schedules/${encodeURIComponent(activeScheduleModalId)}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete schedule');
      }

      if (scheduleModalFeedback) {
        scheduleModalFeedback.textContent = 'Schedule deleted';
        scheduleModalFeedback.style.color = '#136f63';
      }

      setTimeout(() => window.location.reload(), 250);
    } catch (error) {
      if (scheduleModalFeedback) {
        scheduleModalFeedback.textContent = error.message;
        scheduleModalFeedback.style.color = '#b42318';
      }
      setButtonLoading(scheduleModalDeleteBtn, false);
      scheduleModalDeleteBtn.disabled = false;
    }
  });
}

/* ---------- Custom Commands ---------- */

const commandForm = document.getElementById('command-form');
const commandFeedback = document.getElementById('command-feedback');
const commandAdvancedFields = document.getElementById('command-advanced-fields');
const commandTriggerInput = document.getElementById('commandTrigger');
const commandMediaTypeInput = document.getElementById('commandMediaType');
const commandResponseInput = document.getElementById('commandResponse');
const commandMediaSourceInput = document.getElementById('commandMediaSource');
const commandMediaUrlInput = document.getElementById('commandMediaUrl');
const commandMediaUploadInput = document.getElementById('commandMediaUpload');
const commandMediaUploadHint = document.getElementById('commandMediaUploadHint');
const commandFileNameInput = document.getElementById('commandFileName');
const commandMediaSourceField = document.getElementById('commandMediaSourceField');
const commandMediaUrlField = document.getElementById('commandMediaUrlField');
const commandMediaUploadField = document.getElementById('commandMediaUploadField');
const commandFileNameField = document.getElementById('commandFileNameField');
const commandResponseRuleHint = document.getElementById('commandResponseRuleHint');
const commandMediaSourceTabs = Array.from(document.querySelectorAll('[data-command-media-source]'));
const commandSubmitBtn = document.getElementById('commandSubmitBtn');
const addButtonRowBtn = document.getElementById('addButtonRowBtn');
const openButtonSetupGuideBtn = document.getElementById('openButtonSetupGuideBtn');
const buttonRows = document.getElementById('buttonRows');
const buttonSetupGuideModal = document.getElementById('buttonSetupGuideModal');
const closeButtonSetupGuideModalBtn = document.getElementById('closeButtonSetupGuideModal');
const buttonSetupGuideModalCloseBtn = document.getElementById('buttonSetupGuideModalCloseBtn');

const commandsByTrigger = new Map(
  (Array.isArray(window.__CUSTOM_COMMANDS__) ? window.__CUSTOM_COMMANDS__ : []).map((item) => [
    item.trigger,
    item,
  ])
);

function buttonRowTemplate(button = {}, onChange = () => {}) {
  const row = document.createElement('div');
  row.className = 'button-row';

  let params = {};
  if (typeof button.buttonParamsJson === 'string') {
    try {
      params = JSON.parse(button.buttonParamsJson);
    } catch (error) {
      params = {};
    }
  }

  const name = button.name || 'quick_reply';
  const singleSelectSections = Array.isArray(params.sections)
    ? params.sections.filter((section) => section && typeof section === 'object')
    : [];
  const firstSingleSelectSection = singleSelectSections[0] || null;
  const firstSingleSelectRow = Array.isArray(params.sections)
    ? params.sections
      .flatMap((section) => (Array.isArray(section?.rows) ? section.rows : []))
      .find((item) => item && typeof item === 'object' && (item.id || item.title))
    : null;

  row.innerHTML = `
    <select class="btn-type-select">
      <option value="quick_reply">Quick Reply</option>
      <option value="cta_url">Open Link</option>
      <option value="cta_call">Call</option>
      <option value="cta_wa">WhatsApp</option>
      <option value="cta_copy">Copy Code</option>
      <option value="single_select">Single Select</option>
    </select>
    <input class="btn-label-input" placeholder="Button label" />
    <input class="btn-value-input" placeholder="Value (id / URL / phone)" />
    <button type="button" class="btn btn-ghost btn-sm btn-remove-row" aria-label="Remove button">&times;</button>
    <div class="single-select-editor" hidden>
      <div class="single-select-editor-head">
        <input class="single-select-section-title" placeholder="Section title (default: Options)" />
        <input class="single-select-highlight-label" placeholder="Highlight label (optional)" />
        <button type="button" class="btn btn-outline btn-sm btn-add-single-row">Add Row</button>
      </div>
      <div class="single-select-rows-editor"></div>
    </div>
  `;

  const typeSelect = row.querySelector('.btn-type-select');
  const labelInput = row.querySelector('.btn-label-input');
  const valueInput = row.querySelector('.btn-value-input');
  const removeBtn = row.querySelector('.btn-remove-row');
  const singleSelectEditor = row.querySelector('.single-select-editor');
  const singleSelectSectionTitleInput = row.querySelector('.single-select-section-title');
  const singleSelectHighlightLabelInput = row.querySelector('.single-select-highlight-label');
  const singleSelectRowsEditor = row.querySelector('.single-select-rows-editor');
  const addSingleRowBtn = row.querySelector('.btn-add-single-row');

  function setSingleSelectEditorVisible(isVisible) {
    const visible = Boolean(isVisible);
    if (singleSelectEditor) {
      singleSelectEditor.hidden = !visible;
      singleSelectEditor.setAttribute('aria-hidden', String(!visible));
    }
    row.classList.toggle('is-single-select', visible);
  }

  function buildSingleSelectRowEditor(rowData = {}) {
    const rowEditor = document.createElement('div');
    rowEditor.className = 'single-select-row-editor';
    rowEditor.innerHTML = `
      <input class="single-select-row-title" placeholder="Row title" />
      <input class="single-select-row-id" placeholder="Row id" />
      <input class="single-select-row-header" placeholder="Header (optional)" />
      <input class="single-select-row-description" placeholder="Description (optional)" />
      <button type="button" class="btn btn-ghost btn-sm btn-remove-single-row" aria-label="Remove single select row">&times;</button>
    `;

    const rowTitleInput = rowEditor.querySelector('.single-select-row-title');
    const rowIdInput = rowEditor.querySelector('.single-select-row-id');
    const rowHeaderInput = rowEditor.querySelector('.single-select-row-header');
    const rowDescriptionInput = rowEditor.querySelector('.single-select-row-description');
    const removeSingleRowBtn = rowEditor.querySelector('.btn-remove-single-row');

    rowTitleInput.value = String(rowData.title || '').trim();
    rowIdInput.value = String(rowData.id || '').trim();
    rowHeaderInput.value = String(rowData.header || '').trim();
    rowDescriptionInput.value = String(rowData.description || '').trim();

    rowTitleInput.addEventListener('input', onChange);
    rowIdInput.addEventListener('input', onChange);
    rowHeaderInput.addEventListener('input', onChange);
    rowDescriptionInput.addEventListener('input', onChange);
    removeSingleRowBtn.addEventListener('click', () => {
      rowEditor.remove();
      onChange();
    });

    return rowEditor;
  }

  function getExistingSingleSelectRows() {
    if (!singleSelectSections.length) return [];

    return singleSelectSections
      .flatMap((section) => (Array.isArray(section.rows) ? section.rows : []))
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const id = String(item.id || '').trim();
        const title = String(item.title || '').trim();
        if (!id || !title) return null;

        const header = String(item.header || '').trim();
        const description = String(item.description || '').trim();
        const rowData = { id, title };
        if (header) rowData.header = header;
        if (description) rowData.description = description;
        return rowData;
      })
      .filter(Boolean);
  }

  function ensureSingleSelectEditorRows() {
    if (!singleSelectRowsEditor) return;

    const existingRows = Array.from(singleSelectRowsEditor.querySelectorAll('.single-select-row-editor'));
    if (existingRows.length) return;

    const rowData = firstSingleSelectRow
      ? {
        id: String(firstSingleSelectRow.id || '').trim(),
        title: String(firstSingleSelectRow.title || '').trim(),
        header: String(firstSingleSelectRow.header || '').trim(),
        description: String(firstSingleSelectRow.description || '').trim(),
      }
      : {
        id: String(valueInput.value || '').trim(),
        title: String(labelInput.value || '').trim(),
      };

    singleSelectRowsEditor.appendChild(buildSingleSelectRowEditor(rowData));
  }

  typeSelect.value = name;
  labelInput.value = params.display_text || params.title || firstSingleSelectRow?.title || '';
  valueInput.value = params.id || params.url || params.phone_number || params.copy_code || firstSingleSelectRow?.id || '';
  singleSelectSectionTitleInput.value = String(firstSingleSelectSection?.title || 'Options').trim() || 'Options';
  singleSelectHighlightLabelInput.value = String(firstSingleSelectSection?.highlight_label || '').trim();

  const existingRows = getExistingSingleSelectRows();
  existingRows.forEach((rowData) => {
    singleSelectRowsEditor.appendChild(buildSingleSelectRowEditor(rowData));
  });

  function syncPlaceholder() {
    if (typeSelect.value === 'cta_url') {
      valueInput.placeholder = 'https://example.com';
      valueInput.hidden = false;
      setSingleSelectEditorVisible(false);
    } else if (typeSelect.value === 'cta_call') {
      valueInput.placeholder = '+60123456789';
      valueInput.hidden = false;
      setSingleSelectEditorVisible(false);
    } else if (typeSelect.value === 'cta_wa') {
      valueInput.placeholder = '60123456789';
      valueInput.hidden = false;
      setSingleSelectEditorVisible(false);
    } else if (typeSelect.value === 'cta_copy') {
      valueInput.placeholder = 'DISKAUN10';
      valueInput.hidden = false;
      setSingleSelectEditorVisible(false);
    } else if (typeSelect.value === 'single_select') {
      valueInput.placeholder = 'row_id atau JSON rows (contoh: [{"id":"id1","title":"Option 1"}])';
      valueInput.hidden = true;
      setSingleSelectEditorVisible(true);
      ensureSingleSelectEditorRows();
    } else {
      valueInput.placeholder = 'reply_id';
      valueInput.hidden = false;
      setSingleSelectEditorVisible(false);
    }
  }
  syncPlaceholder();
  typeSelect.addEventListener('change', () => {
    syncPlaceholder();
    onChange();
  });

  labelInput.addEventListener('input', onChange);
  valueInput.addEventListener('input', onChange);
  singleSelectSectionTitleInput.addEventListener('input', onChange);
  singleSelectHighlightLabelInput.addEventListener('input', onChange);
  addSingleRowBtn.addEventListener('click', () => {
    if (!singleSelectRowsEditor) return;
    singleSelectRowsEditor.appendChild(buildSingleSelectRowEditor());
    onChange();
  });
  removeBtn.addEventListener('click', () => {
    row.remove();
    onChange();
  });

  return row;
}

function addButtonRow(targetRows = buttonRows, button = {}, onChange = () => {}) {
  if (!targetRows) return;
  targetRows.appendChild(buttonRowTemplate(button, onChange));
}

function clearButtonRows() {
  if (buttonRows) buttonRows.innerHTML = '';
}

function parseSingleSelectRowsInput(rawValue, fallbackTitle) {
  const cleanValue = String(rawValue || '').trim();
  const cleanTitle = String(fallbackTitle || '').trim() || 'Option';
  if (!cleanValue) return [];

  if (cleanValue.startsWith('[')) {
    try {
      const parsed = JSON.parse(cleanValue);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const id = String(item.id || '').trim();
            const title = String(item.title || '').trim();
            const description = String(item.description || '').trim();
            const header = String(item.header || '').trim();
            if (!id || !title) return null;

            const row = { id, title };
            if (description) row.description = description;
            if (header) row.header = header;
            return row;
          })
          .filter(Boolean);
      }
    } catch (error) {
      // Fall back to single row input format when JSON is invalid.
    }
  }

  return [{ id: cleanValue, title: cleanTitle }];
}

function collectButtonsFromRows(targetRows = buttonRows, options = {}) {
  if (!targetRows) return [];

  const allowEmptyUrl = Boolean(options && options.allowEmptyUrl);

  return Array.from(targetRows.querySelectorAll('.button-row'))
    .map((row) => {
      const type = row.querySelector('.btn-type-select').value;
      const label = row.querySelector('.btn-label-input').value.trim();
      const value = row.querySelector('.btn-value-input').value.trim();
      const singleSelectSectionTitleInput = row.querySelector('.single-select-section-title');
      const singleSelectHighlightLabelInput = row.querySelector('.single-select-highlight-label');
      const singleSelectRows = Array.from(row.querySelectorAll('.single-select-row-editor'));
      if (!label) return null;
      if (type !== 'single_select' && type !== 'cta_url' && !value) return null;
      if (type === 'cta_url' && !allowEmptyUrl && !value) return null;

      let params = { display_text: label };
      if (type === 'cta_url') {
        params.url = value;
        params.merchant_url = value;
      }
      else if (type === 'cta_call') params.phone_number = value;
      else if (type === 'cta_wa') params.phone_number = value;
      else if (type === 'cta_copy') params.copy_code = value;
      else if (type === 'single_select') {
        let rows = singleSelectRows
          .map((item) => {
            const title = String(item.querySelector('.single-select-row-title')?.value || '').trim();
            const id = String(item.querySelector('.single-select-row-id')?.value || '').trim();
            const header = String(item.querySelector('.single-select-row-header')?.value || '').trim();
            const description = String(item.querySelector('.single-select-row-description')?.value || '').trim();
            if (!id || !title) return null;

            const rowData = { id, title };
            if (header) rowData.header = header;
            if (description) rowData.description = description;
            return rowData;
          })
          .filter(Boolean);

        if (!rows.length) {
          rows = parseSingleSelectRowsInput(value, label);
        }
        if (!rows.length) return null;

        const sectionTitle = String(singleSelectSectionTitleInput?.value || '').trim() || 'Options';
        const highlightLabel = String(singleSelectHighlightLabelInput?.value || '').trim();
        const section = {
          title: sectionTitle,
          rows,
        };
        if (highlightLabel) {
          section.highlight_label = highlightLabel;
        }

        params = {
          title: label,
          sections: [section],
        };
      }
      else {
        params.id = value;
      }

      return { name: type, buttonParamsJson: JSON.stringify(params) };
    })
    .filter(Boolean);
}

if (addButtonRowBtn) {
  addButtonRowBtn.addEventListener('click', () => addButtonRow(buttonRows, {}, updateCommandSubmitState));
}

if (scheduleAddButtonRowBtn) {
  scheduleAddButtonRowBtn.addEventListener('click', () => addButtonRow(scheduleButtonRows));
}

if (sendAddButtonRowBtn) {
  sendAddButtonRowBtn.addEventListener('click', () => addButtonRow(sendButtonRows));
}

function closeButtonSetupGuideModal() {
  if (!buttonSetupGuideModal) return;
  buttonSetupGuideModal.hidden = true;
  syncModalBodyScrollLock();
}

function openButtonSetupGuideModal() {
  if (!buttonSetupGuideModal) return;
  buttonSetupGuideModal.hidden = false;
  syncModalBodyScrollLock();
}

if (openButtonSetupGuideBtn) {
  openButtonSetupGuideBtn.addEventListener('click', openButtonSetupGuideModal);
}

if (closeButtonSetupGuideModalBtn) {
  closeButtonSetupGuideModalBtn.addEventListener('click', closeButtonSetupGuideModal);
}

if (buttonSetupGuideModalCloseBtn) {
  buttonSetupGuideModalCloseBtn.addEventListener('click', closeButtonSetupGuideModal);
}

if (buttonSetupGuideModal) {
  buttonSetupGuideModal.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.closeModal === 'button-setup-guide') {
      closeButtonSetupGuideModal();
    }
  });
}

function setCommandFeedback(message, color) {
  if (!commandFeedback) return;
  commandFeedback.textContent = message;
  commandFeedback.style.color = color || '#5d645d';
}

function normalizeMediaSourceValue(value) {
  return String(value || '').trim() === 'upload' ? 'upload' : 'url';
}

function syncSendMediaSourceTabs() {
  const selectedSource = normalizeMediaSourceValue(sendMediaSourceInput?.value || 'url');

  sendMediaSourceTabs.forEach((tab) => {
    const tabSource = normalizeMediaSourceValue(tab.dataset.sendMediaSource || 'url');
    const isActive = tabSource === selectedSource;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
}

function setSendMediaSource(source) {
  if (!sendMediaSourceInput) return;
  sendMediaSourceInput.value = normalizeMediaSourceValue(source);
  syncSendMediaSourceTabs();
  updateSendMediaFlow();
}

function updateSendMediaFlow() {
  const selectedMediaType = String(sendMediaTypeInput?.value || '').trim();
  const isNoMedia = !selectedMediaType || selectedMediaType === 'none';
  const isDocument = selectedMediaType === 'document';
  const showMediaFields = !isNoMedia;

  if (sendMediaFields) {
    sendMediaFields.hidden = !showMediaFields;
  }

  if (!showMediaFields) {
    if (sendMediaUrlInput) sendMediaUrlInput.value = '';
    if (sendMediaUploadInput) sendMediaUploadInput.value = '';
    if (sendFileNameInput) sendFileNameInput.value = '';
    if (sendMediaSourceInput) sendMediaSourceInput.value = 'url';
  }

  const mediaSource = normalizeMediaSourceValue(sendMediaSourceInput?.value || 'url');
  if (sendMediaSourceInput) {
    sendMediaSourceInput.value = mediaSource;
  }
  syncSendMediaSourceTabs();
  const useUpload = showMediaFields && mediaSource === 'upload';

  if (sendMediaSourceField) {
    sendMediaSourceField.hidden = !showMediaFields;
  }
  if (sendMediaUrlField) {
    sendMediaUrlField.hidden = !showMediaFields || useUpload;
  }
  if (sendMediaUrlInput && (!showMediaFields || useUpload)) {
    sendMediaUrlInput.value = '';
  }
  if (sendMediaUploadField) {
    sendMediaUploadField.hidden = !showMediaFields || !useUpload;
  }
  if (sendMediaUploadInput && (!showMediaFields || !useUpload)) {
    sendMediaUploadInput.value = '';
  }
  if (sendFileNameField) {
    sendFileNameField.hidden = !showMediaFields || !isDocument;
  }
  if (sendFileNameInput && (!showMediaFields || !isDocument)) {
    sendFileNameInput.value = '';
  }
}

function syncScheduleMediaSourceTabs() {
  const selectedSource = normalizeMediaSourceValue(scheduleMediaSourceInput?.value || 'url');

  scheduleMediaSourceTabs.forEach((tab) => {
    const tabSource = normalizeMediaSourceValue(tab.dataset.scheduleMediaSource || 'url');
    const isActive = tabSource === selectedSource;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
}

function setScheduleMediaSource(source) {
  if (!scheduleMediaSourceInput) return;
  scheduleMediaSourceInput.value = normalizeMediaSourceValue(source);
  syncScheduleMediaSourceTabs();
  updateScheduleFormFlow();
}

function updateScheduleFormFlow() {
  const repeatType = String(scheduleRepeatTypeInput?.value || '').trim();
  const hasRepeatChoice = repeatType === 'none' || repeatType === 'daily' || repeatType === 'weekly';
  const hasSendTimeValue = Boolean(String(scheduleAtInput?.value || '').trim());

  if (scheduleSendTimeField) {
    scheduleSendTimeField.hidden = !hasRepeatChoice;
  }

  const showMediaStep = hasRepeatChoice && hasSendTimeValue;
  if (scheduleMediaTypeField) {
    scheduleMediaTypeField.hidden = !showMediaStep;
  }

  const selectedMediaType = String(scheduleMediaTypeInput?.value || '').trim();
  const hasMediaChoice = selectedMediaType !== '';
  const isNoMedia = !selectedMediaType || selectedMediaType === 'none';
  const isDocument = selectedMediaType === 'document';
  const showMediaFields = showMediaStep && !isNoMedia;

  const showTargetStep = showMediaStep && hasMediaChoice;
  if (scheduleTargetStep) {
    scheduleTargetStep.hidden = !showTargetStep;
  }

  if (!showTargetStep && targetValueField) {
    targetValueField.hidden = true;
  }

  if (!showMediaStep && scheduleMediaTypeInput) {
    scheduleMediaTypeInput.value = '';
  }

  if (scheduleMediaFields) {
    scheduleMediaFields.hidden = !showMediaFields;
  }

  const mediaSource = normalizeMediaSourceValue(scheduleMediaSourceInput?.value || 'url');
  if (scheduleMediaSourceInput) {
    scheduleMediaSourceInput.value = mediaSource;
  }
  syncScheduleMediaSourceTabs();
  const useUpload = showMediaFields && mediaSource === 'upload';

  if (scheduleMediaSourceField) {
    scheduleMediaSourceField.hidden = !showMediaFields;
  }
  if (scheduleMediaUrlField) {
    scheduleMediaUrlField.hidden = !showMediaFields || useUpload;
  }
  if (scheduleMediaUrlInput && (!showMediaFields || useUpload)) {
    scheduleMediaUrlInput.value = '';
  }
  if (scheduleMediaUploadField) {
    scheduleMediaUploadField.hidden = !showMediaFields || !useUpload;
  }
  if (scheduleMediaUploadInput && (!showMediaFields || !useUpload)) {
    scheduleMediaUploadInput.value = '';
  }
  if (scheduleFileNameField) {
    scheduleFileNameField.hidden = !showMediaFields || !isDocument;
  }
  if (scheduleFileNameInput && (!showMediaFields || !isDocument)) {
    scheduleFileNameInput.value = '';
  }

  if (showTargetStep) {
    syncTargetInputContent();
  }
}

function updateScheduleRepeatFlow() {
  const repeatType = String(scheduleRepeatTypeInput?.value || 'none').trim();
  const showDays = repeatType === 'weekly';

  if (scheduleRepeatDaysField) {
    scheduleRepeatDaysField.hidden = !showDays;
  }

  if (!showDays && scheduleRepeatDaysPicker) {
    scheduleRepeatDaysPicker.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = false;
    });
  }

  updateScheduleAtInputMode();
  updateScheduleRepeatDaysLabel();
  updateScheduleFormFlow();
}

async function uploadScheduleMediaFile(file, mediaType) {
  const formData = new FormData();
  formData.set('mediaFile', file);
  formData.set('mediaType', mediaType);

  const response = await fetch('/api/schedules/upload-media', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to upload media file');
  }

  return data;
}

function updateScheduleRepeatDaysLabel() {
  if (!scheduleRepeatDaysTriggerLabel || !scheduleRepeatDaysPicker) return;
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const checked = Array.from(scheduleRepeatDaysPicker.querySelectorAll('input[type="checkbox"]:checked'))
    .map((input) => Number(input.value))
    .sort();

  scheduleRepeatDaysTriggerLabel.textContent = checked.length
    ? checked.map((day) => weekdayNames[day]).join(', ')
    : 'Select days';
}

function toggleScheduleRepeatDaysPopover(forceOpen) {
  if (!scheduleRepeatDaysPopover || !scheduleRepeatDaysTrigger) return;
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : scheduleRepeatDaysPopover.hidden;
  scheduleRepeatDaysPopover.hidden = !shouldOpen;
}

if (scheduleRepeatDaysPicker) {
  scheduleRepeatDaysPicker.addEventListener('change', updateScheduleRepeatDaysLabel);
}

if (scheduleRepeatDaysTrigger) {
  scheduleRepeatDaysTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleScheduleRepeatDaysPopover();
  });
}

if (scheduleRepeatDaysDoneBtn) {
  scheduleRepeatDaysDoneBtn.addEventListener('click', () => {
    toggleScheduleRepeatDaysPopover(false);
  });
}

document.addEventListener('click', (event) => {
  if (!scheduleRepeatDaysPopover || scheduleRepeatDaysPopover.hidden) return;
  const target = event.target;
  if (target instanceof HTMLElement && (scheduleRepeatDaysPopover.contains(target) || scheduleRepeatDaysTrigger?.contains(target))) return;
  toggleScheduleRepeatDaysPopover(false);
});

if (scheduleRepeatTypeInput) {
  scheduleRepeatTypeInput.addEventListener('change', updateScheduleRepeatFlow);
  updateScheduleRepeatFlow();
  updateScheduleRepeatDaysLabel();
}

if (scheduleAtInput) {
  scheduleAtInput.addEventListener('input', updateScheduleFormFlow);
  scheduleAtInput.addEventListener('change', updateScheduleFormFlow);
}

if (scheduleMediaTypeInput) {
  scheduleMediaTypeInput.addEventListener('change', updateScheduleFormFlow);
  updateScheduleFormFlow();
}

if (scheduleMediaSourceTabs.length) {
  scheduleMediaSourceTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const selectedSource = normalizeMediaSourceValue(tab.dataset.scheduleMediaSource || 'url');
      setScheduleMediaSource(selectedSource);
    });
  });
}

function syncCommandMediaSourceTabs() {
  const selectedSource = normalizeMediaSourceValue(commandMediaSourceInput?.value || 'url');

  commandMediaSourceTabs.forEach((tab) => {
    const tabSource = normalizeMediaSourceValue(tab.dataset.commandMediaSource || 'url');
    const isActive = tabSource === selectedSource;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
}

function setCommandMediaSource(source) {
  if (!commandMediaSourceInput) return;
  commandMediaSourceInput.value = normalizeMediaSourceValue(source);
  syncCommandMediaSourceTabs();
  updateCommandFormFlow();
}

function getNormalizedMediaType() {
  if (!commandMediaTypeInput) return '';
  const selected = String(commandMediaTypeInput.value || '').trim();
  if (!selected || selected === 'none') return '';
  return selected;
}

function isMediaTypeStepReady() {
  if (!commandMediaTypeInput) return false;
  return Boolean(String(commandMediaTypeInput.value || '').trim());
}

function updateCommandSubmitState() {
  if (!commandSubmitBtn) return;

  const trigger = String(commandTriggerInput?.value || '').trim();
  const hasValidTrigger = Boolean(trigger) && trigger.startsWith('.');
  const selectedMediaType = String(commandMediaTypeInput?.value || '').trim();
  const hasMediaType = Boolean(selectedMediaType);
  const isNoMedia = selectedMediaType === 'none';
  const mediaSource = String(commandMediaSourceInput?.value || 'url');
  const hasResponse = Boolean(String(commandResponseInput?.value || '').trim());
  const hasMediaUrl = Boolean(String(commandMediaUrlInput?.value || '').trim());
  const hasUploadFile = Boolean(commandMediaUploadInput?.files && commandMediaUploadInput.files.length);
  const hasButtons = collectButtonsFromRows().length > 0;
  const hasMediaInput = isNoMedia
    ? false
    : mediaSource === 'upload'
      ? hasUploadFile || hasMediaUrl
      : hasMediaUrl;
  const requireResponseForMediaButtons = !isNoMedia && hasButtons;
  const isReady = hasValidTrigger
    && hasMediaType
    && (hasResponse || hasMediaInput)
    && (!requireResponseForMediaButtons || hasResponse);

  if (commandResponseRuleHint) {
    commandResponseRuleHint.hidden = !requireResponseForMediaButtons;
  }

  commandSubmitBtn.disabled = !isReady;
  commandSubmitBtn.classList.toggle('is-ready', isReady);
}

function updateCommandFormFlow() {
  const selectedMediaType = String(commandMediaTypeInput?.value || '').trim();
  const showAdvanced = Boolean(selectedMediaType);

  if (commandAdvancedFields) {
    commandAdvancedFields.hidden = !showAdvanced;
  }

  const isNoMedia = selectedMediaType === 'none';
  const isDocument = selectedMediaType === 'document';
  const mediaSource = normalizeMediaSourceValue(commandMediaSourceInput?.value || 'url');
  if (commandMediaSourceInput) {
    commandMediaSourceInput.value = mediaSource;
  }
  syncCommandMediaSourceTabs();
  const showMediaUrl = showAdvanced && !isNoMedia;
  const showFileName = showAdvanced && isDocument;
  const showMediaSource = showAdvanced && !isNoMedia;
  const useUpload = showMediaSource && mediaSource === 'upload';

  if (commandMediaSourceField) {
    commandMediaSourceField.hidden = !showMediaSource;
  }
  if (commandMediaUrlField) {
    commandMediaUrlField.hidden = !showMediaUrl || useUpload;
  }
  if (commandMediaUrlInput) {
    commandMediaUrlInput.required = showMediaUrl && !useUpload;
    if (!showMediaUrl || useUpload) {
      commandMediaUrlInput.value = '';
    }
  }

  if (commandMediaUploadField) {
    commandMediaUploadField.hidden = !showMediaUrl || !useUpload;
  }
  if (commandMediaUploadInput) {
    commandMediaUploadInput.required = showMediaUrl && useUpload;
    if (!showMediaUrl || !useUpload) {
      commandMediaUploadInput.value = '';
    }
  }
  if (commandMediaUploadHint) {
    commandMediaUploadHint.textContent = useUpload
      ? 'Choose a file to upload and use as media source.'
      : 'Choose URL source or upload source for media.';
  }

  if (commandFileNameField) {
    commandFileNameField.hidden = !showFileName;
  }
  if (commandFileNameInput && !showFileName) {
    commandFileNameInput.value = '';
  }

  updateCommandSubmitState();
}

function resetCommandForm() {
  if (!commandForm) return;
  commandForm.reset();
  clearButtonRows();
  if (commandTriggerInput) commandTriggerInput.disabled = false;
  if (commandSubmitBtn) commandSubmitBtn.textContent = 'Save Command';
  if (commandMediaSourceInput) commandMediaSourceInput.value = 'url';
  setCommandFeedback('');
  updateCommandFormFlow();
}

function normalizeCommandTrigger(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const withoutPrefix = raw.replace(/^[!.]+/, '').trim();
  if (!withoutPrefix) return '.';
  return `.${withoutPrefix}`;
}

if (commandTriggerInput) {
  commandTriggerInput.addEventListener('input', () => {
    const normalized = normalizeCommandTrigger(commandTriggerInput.value);
    if (commandTriggerInput.value !== normalized) {
      commandTriggerInput.value = normalized;
    }
    updateCommandFormFlow();
  });
}

if (commandMediaTypeInput) {
  commandMediaTypeInput.addEventListener('change', updateCommandFormFlow);
}

if (commandMediaSourceInput) {
  commandMediaSourceInput.addEventListener('change', updateCommandFormFlow);
}

if (commandMediaSourceTabs.length) {
  commandMediaSourceTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const selectedSource = normalizeMediaSourceValue(tab.dataset.commandMediaSource || 'url');
      setCommandMediaSource(selectedSource);
    });
  });
}

if (commandResponseInput) {
  commandResponseInput.addEventListener('input', updateCommandSubmitState);
}

if (commandMediaUrlInput) {
  commandMediaUrlInput.addEventListener('input', updateCommandSubmitState);
}

if (commandMediaUploadInput) {
  commandMediaUploadInput.addEventListener('change', updateCommandSubmitState);
}

async function uploadCommandMediaFile(file, mediaType) {
  const formData = new FormData();
  formData.set('mediaFile', file);
  formData.set('mediaType', mediaType);

  const response = await fetch('/api/custom-commands/upload-media', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to upload media file');
  }

  return data;
}

if (commandForm) {
  commandForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitBtn = commandSubmitBtn || commandForm.querySelector('button[type="submit"]');

    const formData = new FormData(commandForm);
    const selectedMediaType = String(formData.get('mediaType') || '').trim();
    const selectedMediaSource = String(formData.get('mediaSource') || 'url').trim();

    let mediaUrl = String(formData.get('mediaUrl') || '').trim();
    let fileName = String(formData.get('fileName') || '').trim();

    if (selectedMediaType && selectedMediaType !== 'none' && selectedMediaSource === 'upload') {
      const selectedFile = commandMediaUploadInput?.files?.[0];
      if (selectedFile) {
        setCommandFeedback('Uploading media file...', '#5d645d');
        const uploaded = await uploadCommandMediaFile(selectedFile, selectedMediaType);
        mediaUrl = String(uploaded.mediaUrl || '').trim();
        if (!fileName) {
          fileName = String(uploaded.fileName || '').trim();
        }
      }
    }

    const payload = {
      trigger: normalizeCommandTrigger(formData.get('trigger') || ''),
      response: String(formData.get('response') || '').trim(),
      mediaType: getNormalizedMediaType(),
      mediaUrl,
      fileName,
      buttons: collectButtonsFromRows(),
    };

    setCommandFeedback('Saving command...', '#5d645d');
    setButtonLoading(submitBtn, true, 'Saving command');

    try {
      const response = await fetch('/api/custom-commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save command');
      }

      setCommandFeedback('Command saved', '#136f63');
      setTimeout(() => window.location.reload(), 350);
    } catch (error) {
      setCommandFeedback(error.message, '#b42318');
    } finally {
      setButtonLoading(submitBtn, false);
      updateCommandSubmitState();
    }
  });
}

const commandPreviewModal = document.getElementById('commandPreviewModal');
const closeCommandPreviewModalBtn = document.getElementById('closeCommandPreviewModal');
const commandPreviewViewport = document.getElementById('commandPreviewViewport');
const commandPreviewImage = document.getElementById('commandPreviewImage');
const commandPreviewVideo = document.getElementById('commandPreviewVideo');
const commandPreviewAudio = document.getElementById('commandPreviewAudio');
const commandPreviewDocument = document.getElementById('commandPreviewDocument');
const commandPreviewDocumentLink = document.getElementById('commandPreviewDocumentLink');
const commandPreviewBadge = document.getElementById('commandPreviewBadge');
const commandPreviewTitle = document.getElementById('commandPreviewTitle');
const commandPreviewDescription = document.getElementById('commandPreviewDescription');
const commandPreviewContent = document.getElementById('commandPreviewContent');
const commandPreviewMeta = document.getElementById('commandPreviewMeta');
const commandPreviewDeliveryHint = document.getElementById('commandPreviewDeliveryHint');
const commandPreviewButtons = document.getElementById('commandPreviewButtons');
const commandPreviewActionBtn = document.getElementById('commandPreviewActionBtn');
const commandPreviewIncomingText = document.getElementById('commandPreviewIncomingText');
const commandPreviewIncomingTime = document.getElementById('commandPreviewIncomingTime');
const commandPreviewOutgoingTime = document.getElementById('commandPreviewOutgoingTime');
const commandPreviewDateChip = document.getElementById('commandPreviewDateChip');
const commandPreviewStatusTime = document.querySelector('.wa-status-time');

function closeCommandPreviewModal() {
  if (!commandPreviewModal) return;

  if (commandPreviewVideo) {
    commandPreviewVideo.pause();
    commandPreviewVideo.removeAttribute('src');
    commandPreviewVideo.load();
  }

  if (commandPreviewAudio) {
    commandPreviewAudio.pause();
    commandPreviewAudio.removeAttribute('src');
    commandPreviewAudio.load();
  }

  commandPreviewModal.hidden = true;
  syncModalBodyScrollLock();
}

function parseButtonParams(button) {
  if (!button || typeof button !== 'object') return {};
  if (typeof button.buttonParamsJson !== 'string') return {};

  try {
    const parsed = JSON.parse(button.buttonParamsJson);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

function resetCommandPreviewMedia() {
  if (commandPreviewImage) {
    commandPreviewImage.hidden = false;
  }

  if (commandPreviewVideo) {
    commandPreviewVideo.hidden = true;
  }

  if (commandPreviewAudio) {
    commandPreviewAudio.hidden = true;
  }

  if (commandPreviewDocument) {
    commandPreviewDocument.hidden = true;
  }
}

function truncatePreviewValue(value, maxLength = 42) {
  const clean = String(value || '').trim();
  if (!clean) return '';
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1)}...`;
}

function getButtonKindLabel(kind) {
  if (kind === 'cta_url') return 'Open Link';
  if (kind === 'cta_call') return 'Call';
  if (kind === 'cta_wa') return 'WhatsApp';
  if (kind === 'cta_copy') return 'Copy Code';
  if (kind === 'single_select') return 'Single Select';
  return 'Quick Reply';
}

function buildPreviewNowParts() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  const day = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
  return { time, day };
}

function renderCommandPreviewMeta(command) {
  if (!commandPreviewMeta) return;

  const mediaType = String(command.mediaType || '').trim();
  const mediaUrl = String(command.mediaUrl || '').trim();
  const hasMedia = Boolean(mediaType && mediaUrl);
  const buttons = Array.isArray(command.buttons) ? command.buttons : [];
  const buttonCount = buttons.length;
  const category = String(command.category || '').trim() || 'General';

  const chips = [
    `Category: ${category}`,
    hasMedia ? `Media: ${mediaType}` : 'Media: none',
    buttonCount ? `Buttons: ${buttonCount}` : 'Buttons: none',
    hasMedia && buttonCount ? 'Delivery: 2 messages' : 'Delivery: 1 message',
  ];

  commandPreviewMeta.innerHTML = '';
  chips.forEach((text) => {
    const chip = document.createElement('span');
    chip.className = 'command-preview-meta-chip';
    chip.textContent = text;
    commandPreviewMeta.appendChild(chip);
  });
  commandPreviewMeta.hidden = false;
}

function renderCommandPreviewDeliveryHint(command) {
  if (!commandPreviewDeliveryHint) return;

  const mediaType = String(command.mediaType || '').trim();
  const mediaUrl = String(command.mediaUrl || '').trim();
  const hasMedia = Boolean(mediaType && mediaUrl);
  const hasButtons = Array.isArray(command.buttons) && command.buttons.length > 0;
  const hasResponse = Boolean(String(command.response || '').trim());

  if (hasMedia && hasButtons) {
    commandPreviewDeliveryHint.textContent = hasResponse
      ? 'Preview note: media + caption will send first, then buttons in a second message for WhatsApp compatibility.'
      : 'Warning: media + buttons without response text can cause unclear output. Add response text for better result.';
    commandPreviewDeliveryHint.hidden = false;
    return;
  }

  if (hasButtons && !hasMedia) {
    commandPreviewDeliveryHint.textContent = 'Preview note: this command sends one text message with interactive buttons.';
    commandPreviewDeliveryHint.hidden = false;
    return;
  }

  commandPreviewDeliveryHint.textContent = '';
  commandPreviewDeliveryHint.hidden = true;
}

function renderCommandPreviewButtons(command) {
  if (!commandPreviewButtons) return;

  commandPreviewButtons.innerHTML = '';
  const list = Array.isArray(command.buttons) ? command.buttons : [];
  if (!list.length) {
    commandPreviewButtons.hidden = true;
    return;
  }

  list.forEach((buttonItem) => {
    const params = parseButtonParams(buttonItem);
    const firstSingleSelectRow = Array.isArray(params.sections)
      ? params.sections
        .flatMap((section) => (Array.isArray(section?.rows) ? section.rows : []))
        .find((item) => item && typeof item === 'object' && (item.id || item.title))
      : null;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn wa-preview-chip';
    const kind = String(buttonItem.name || '').trim();
    const label = params.display_text || params.title || firstSingleSelectRow?.title || 'Button';
    button.textContent = `${getButtonKindLabel(kind)}: ${label}`;

    let metaValue = params.id || params.url || params.phone_number || params.copy_code || firstSingleSelectRow?.id || '';
    if (metaValue) {
      const valueSpan = document.createElement('span');
      valueSpan.className = 'command-preview-button-value';
      valueSpan.textContent = truncatePreviewValue(metaValue);
      button.appendChild(valueSpan);
    }

    if (kind === 'cta_url' && params.url) {
      button.addEventListener('click', () => window.open(params.url, '_blank', 'noopener'));
    } else if (kind === 'cta_call' && params.phone_number) {
      button.addEventListener('click', () => window.open(`tel:${params.phone_number}`, '_self'));
    } else if (kind === 'cta_wa' && params.phone_number) {
      const rawPhone = String(params.phone_number || '');
      const normalizedPhone = rawPhone.replace(/[^0-9]/g, '');
      if (normalizedPhone) {
        button.addEventListener('click', () => window.open(`https://wa.me/${normalizedPhone}`, '_blank', 'noopener'));
      }
    } else if (kind === 'cta_copy' && params.copy_code) {
      button.addEventListener('click', async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(params.copy_code);
            button.textContent = 'Copied';
            setTimeout(() => {
              button.textContent = params.display_text || 'Button';
            }, 1200);
          }
        } catch (error) {
          // Ignore clipboard errors and keep button usable.
        }
      });
    }

    commandPreviewButtons.appendChild(button);
  });

  commandPreviewButtons.hidden = false;
}

function openCommandPreviewModal(command) {
  if (!commandPreviewModal || !command) return;

  const fallbackCover = 'https://avatar.vercel.sh/shadcn1';
  const mediaType = String(command.mediaType || '').trim();
  const mediaUrl = String(command.mediaUrl || '').trim();
  const mediaTypeLabel = mediaType ? mediaType.toUpperCase() : 'TEXT';
  const description = command.description
    ? String(command.description)
    : 'online';
  const textContent = String(command.response || '').trim();
  const { time, day } = buildPreviewNowParts();

  resetCommandPreviewMedia();

  if (commandPreviewImage) {
    commandPreviewImage.src = fallbackCover;
    commandPreviewImage.alt = mediaUrl
      ? `Media preview ${command.trigger || ''}`
      : 'Command cover';
  }

  if (mediaUrl && mediaType === 'image' && commandPreviewImage) {
    commandPreviewImage.src = mediaUrl;
    commandPreviewImage.hidden = false;
  }

  if (mediaUrl && mediaType === 'video' && commandPreviewVideo) {
    commandPreviewImage.hidden = true;
    commandPreviewVideo.src = mediaUrl;
    commandPreviewVideo.hidden = false;
  }

  if (mediaUrl && mediaType === 'audio' && commandPreviewAudio) {
    commandPreviewAudio.src = mediaUrl;
    commandPreviewAudio.hidden = false;
  }

  if (mediaUrl && mediaType === 'document' && commandPreviewDocument && commandPreviewDocumentLink) {
    commandPreviewDocument.hidden = false;
    commandPreviewDocumentLink.href = mediaUrl;
    commandPreviewDocumentLink.textContent = command.fileName || 'Open document';
  }

  if (commandPreviewBadge) {
    commandPreviewBadge.textContent = mediaTypeLabel;
  }

  if (commandPreviewStatusTime) {
    commandPreviewStatusTime.textContent = time;
  }

  if (commandPreviewDateChip) {
    commandPreviewDateChip.textContent = day;
  }

  if (commandPreviewIncomingText) {
    const incomingMessage = command.trigger
      ? `${String(command.trigger).trim()}${mediaUrl ? ' https://example.com/link' : ''}`
      : '!command';
    commandPreviewIncomingText.textContent = incomingMessage;
  }

  if (commandPreviewIncomingTime) {
    commandPreviewIncomingTime.textContent = time;
  }

  if (commandPreviewOutgoingTime) {
    commandPreviewOutgoingTime.textContent = `${time} ✓✓`;
  }

  if (commandPreviewTitle) {
    commandPreviewTitle.textContent = command.trigger || 'Command Preview';
  }

  if (commandPreviewDescription) {
    commandPreviewDescription.textContent = description;
  }

  if (commandPreviewContent) {
    if (textContent) {
      commandPreviewContent.textContent = textContent;
      commandPreviewContent.hidden = false;
    } else {
      commandPreviewContent.textContent = '';
      commandPreviewContent.hidden = true;
    }
  }

  renderCommandPreviewMeta(command);
  renderCommandPreviewDeliveryHint(command);
  renderCommandPreviewButtons(command);

  if (commandPreviewActionBtn) {
    commandPreviewActionBtn.onclick = () => {
      closeCommandPreviewModal();
    };
  }

  commandPreviewModal.hidden = false;
  syncModalBodyScrollLock();
}

document.querySelectorAll('.btn-preview-command').forEach((button) => {
  button.addEventListener('click', () => {
    const trigger = button.dataset.trigger;
    if (!trigger) return;

    const command = commandsByTrigger.get(trigger);
    if (!command) return;

    openCommandPreviewModal(command);
  });
});

const commandDetailModal = document.getElementById('commandDetailModal');
const closeCommandDetailModalBtn = document.getElementById('closeCommandDetailModal');
const commandDetailCloseBtn = document.getElementById('commandDetailCloseBtn');
const commandDetailTriggerValue = document.getElementById('commandDetailTriggerValue');
const commandDetailSourceValue = document.getElementById('commandDetailSourceValue');
const commandDetailMediaValue = document.getElementById('commandDetailMediaValue');
const commandDetailButtonsValue = document.getElementById('commandDetailButtonsValue');
const commandDetailResponseValue = document.getElementById('commandDetailResponseValue');

function closeCommandDetailModal() {
  if (commandDetailModal) {
    commandDetailModal.hidden = true;
  }
  syncModalBodyScrollLock();
}

function openCommandDetailModal(trigger) {
  const key = String(trigger || '').trim();
  if (!key) return;

  const command = commandsByTrigger.get(key);
  if (!command) return;

  if (commandDetailTriggerValue) commandDetailTriggerValue.textContent = key;
  if (commandDetailSourceValue) commandDetailSourceValue.textContent = command.source === 'custom' ? 'Custom' : 'Built-in';
  if (commandDetailMediaValue) commandDetailMediaValue.textContent = command.mediaType || 'none';
  if (commandDetailButtonsValue) {
    const buttons = Array.isArray(command.buttons) ? command.buttons : [];
    commandDetailButtonsValue.textContent = buttons.length ? buttons.map((button) => button.title || button.name || button.value || 'Button').join(', ') : 'none';
  }
  if (commandDetailResponseValue) commandDetailResponseValue.textContent = command.response || 'No response text';

  if (commandDetailModal) {
    commandDetailModal.hidden = false;
  }
  syncModalBodyScrollLock();
}

document.querySelectorAll('.command-detail-trigger[data-trigger]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    openCommandDetailModal(button.dataset.trigger);
  });
});

if (closeCommandDetailModalBtn) {
  closeCommandDetailModalBtn.addEventListener('click', closeCommandDetailModal);
}

if (commandDetailCloseBtn) {
  commandDetailCloseBtn.addEventListener('click', closeCommandDetailModal);
}

if (commandDetailModal) {
  commandDetailModal.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.closeModal === 'command-detail') {
      closeCommandDetailModal();
    }
  });
}

const customCommandEditModal = document.getElementById('customCommandEditModal');
const closeCustomCommandEditModalBtn = document.getElementById('closeCustomCommandEditModal');
const customCommandEditOriginalTriggerInput = document.getElementById('customCommandEditOriginalTrigger');
const customCommandEditTriggerInput = document.getElementById('customCommandEditTrigger');
const customCommandEditMediaTypeInput = document.getElementById('customCommandEditMediaType');
const customCommandEditMediaUrlInput = document.getElementById('customCommandEditMediaUrl');
const customCommandEditFileNameInput = document.getElementById('customCommandEditFileName');
const customCommandEditResponseInput = document.getElementById('customCommandEditResponse');
const customCommandEditAddButtonBtn = document.getElementById('customCommandEditAddButtonBtn');
const customCommandEditButtonRows = document.getElementById('customCommandEditButtonRows');
const customCommandEditFeedback = document.getElementById('customCommandEditFeedback');
const customCommandEditCancelBtn = document.getElementById('customCommandEditCancelBtn');
const customCommandEditSaveBtn = document.getElementById('customCommandEditSaveBtn');

function addCustomCommandEditButtonRow(button) {
  if (!customCommandEditButtonRows) return;
  customCommandEditButtonRows.appendChild(buttonRowTemplate(button));
}

function clearCustomCommandEditButtonRows() {
  if (!customCommandEditButtonRows) return;
  customCommandEditButtonRows.innerHTML = '';
}

function closeCustomCommandEditModal() {
  if (customCommandEditModal) {
    customCommandEditModal.hidden = true;
  }
  if (customCommandEditFeedback) {
    customCommandEditFeedback.textContent = '';
    customCommandEditFeedback.style.color = '#5d645d';
  }
  syncModalBodyScrollLock();
}

function openCustomCommandEditModal(trigger) {
  const key = String(trigger || '').trim();
  if (!key) return;

  const command = commandsByTrigger.get(key);
  if (!command) return;

  if (customCommandEditOriginalTriggerInput) customCommandEditOriginalTriggerInput.value = key;
  if (customCommandEditTriggerInput) customCommandEditTriggerInput.value = key;
  if (customCommandEditMediaTypeInput) customCommandEditMediaTypeInput.value = command.mediaType || 'none';
  if (customCommandEditMediaUrlInput) customCommandEditMediaUrlInput.value = command.mediaUrl || '';
  if (customCommandEditFileNameInput) customCommandEditFileNameInput.value = command.fileName || '';
  if (customCommandEditResponseInput) customCommandEditResponseInput.value = command.response || '';
  clearCustomCommandEditButtonRows();
  const list = Array.isArray(command.buttons) ? command.buttons : [];
  list.forEach((button) => addCustomCommandEditButtonRow(button));
  if (customCommandEditFeedback) {
    customCommandEditFeedback.textContent = '';
    customCommandEditFeedback.style.color = '#5d645d';
  }

  if (customCommandEditModal) {
    customCommandEditModal.hidden = false;
  }
  syncModalBodyScrollLock();
}

if (customCommandEditAddButtonBtn) {
  customCommandEditAddButtonBtn.addEventListener('click', () => {
    addCustomCommandEditButtonRow();
  });
}

document.querySelectorAll('.btn-edit-command-modal').forEach((button) => {
  button.addEventListener('click', () => {
    openCustomCommandEditModal(button.dataset.trigger);
  });
});

if (customCommandEditCancelBtn) {
  customCommandEditCancelBtn.addEventListener('click', closeCustomCommandEditModal);
}

if (closeCustomCommandEditModalBtn) {
  closeCustomCommandEditModalBtn.addEventListener('click', closeCustomCommandEditModal);
}

if (customCommandEditModal) {
  customCommandEditModal.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.closeModal === 'custom-command-edit') {
      closeCustomCommandEditModal();
    }
  });
}

if (customCommandEditSaveBtn) {
  customCommandEditSaveBtn.addEventListener('click', async () => {
    const originalTrigger = String(customCommandEditOriginalTriggerInput?.value || '').trim();
    if (!originalTrigger) return;

    const responseText = String(customCommandEditResponseInput?.value || '').trim();
    const mediaType = String(customCommandEditMediaTypeInput?.value || '').trim();
    const mediaUrl = String(customCommandEditMediaUrlInput?.value || '').trim();
    const fileName = String(customCommandEditFileNameInput?.value || '').trim();
    const buttons = collectButtonsFromRows(customCommandEditButtonRows);

    const payload = {
      response: responseText,
      mediaType: mediaType && mediaType !== 'none' ? mediaType : '',
      mediaUrl,
      fileName,
      buttons,
    };

    setButtonLoading(customCommandEditSaveBtn, true, 'Updating command');
    if (customCommandEditFeedback) {
      customCommandEditFeedback.textContent = 'Saving...';
      customCommandEditFeedback.style.color = '#5d645d';
    }

    try {
      const response = await fetch(`/api/custom-commands/${encodeURIComponent(originalTrigger)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update command');
      }

      window.location.reload();
    } catch (error) {
      if (customCommandEditFeedback) {
        customCommandEditFeedback.textContent = error.message || 'Failed to update command';
        customCommandEditFeedback.style.color = '#b42318';
      }
      setButtonLoading(customCommandEditSaveBtn, false);
    }
  });
}

document.querySelectorAll('.btn-delete-command').forEach((button) => {
  button.addEventListener('click', async () => {
    const trigger = String(button.dataset.trigger || '').trim();
    if (!trigger) return;

    const confirmDelete = await askDestructiveConfirm({
      title: `Delete command ${trigger}?`,
      description: 'This command trigger and its response will be permanently removed.',
      actionLabel: 'Delete',
    });
    if (!confirmDelete) return;

    setButtonLoading(button, true, 'Deleting command');

    try {
      const response = await fetch(`/api/custom-commands/${encodeURIComponent(trigger)}`, {
        method: 'DELETE',
      });
      if (!response.ok && response.status !== 204) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete command');
      }
      window.location.reload();
    } catch (error) {
      window.alert(error.message);
      setButtonLoading(button, false);
    }
  });
});

const builtInCommandModal = document.getElementById('builtInCommandModal');
const closeBuiltInCommandModalBtn = document.getElementById('closeBuiltInCommandModal');
const builtInEditorTitle = document.getElementById('builtInEditorTitle');
const builtInEditorDescription = document.getElementById('builtInEditorDescription');
const builtInEditorTextLabel = document.getElementById('builtInEditorTextLabel');
const builtInEditorText = document.getElementById('builtInEditorText');
const builtInEditorFeedback = document.getElementById('builtInEditorFeedback');
const builtInEditorButtonsSection = document.getElementById('builtInEditorButtonsSection');
const builtInEditorButtonRows = document.getElementById('builtInEditorButtonRows');
const builtInEditorAddButtonBtn = document.getElementById('builtInEditorAddButtonBtn');
const builtInEditorCancelBtn = document.getElementById('builtInEditorCancelBtn');
const builtInEditorSaveBtn = document.getElementById('builtInEditorSaveBtn');

let activeBuiltInCommandKey = '';

const BUILT_IN_COMMAND_EDITOR_META = {
  sch: {
    title: 'Edit .sch',
    description: 'Update usage/help text and interactive buttons for schedule command.',
    textLabel: 'Usage/help text',
  },
  schlist: {
    title: 'Edit .schlist',
    description: 'Update message shown when no schedules are found for current chat.',
    textLabel: 'Empty list message',
  },
  schdel: {
    title: 'Edit .schdel',
    description: 'Update usage/help text shown when schedule delete format is invalid.',
    textLabel: 'Usage/help text',
  },
  vv: {
    title: 'Edit .vv',
    description: 'Update help text shown when .vv is used without valid quoted view-once media.',
    textLabel: 'Help text',
  },
  sticker: {
    title: 'Edit .sticker',
    description: 'Update usage/help text shown when .sticker is used without media.',
    textLabel: 'Help text',
  },
  zip: {
    title: 'Edit .zip',
    description: 'Update usage/help text shown when .zip is used without a replied file.',
    textLabel: 'Help text',
  },
  unzip: {
    title: 'Edit .unzip',
    description: 'Update usage/help text shown when .unzip is used without a replied ZIP file.',
    textLabel: 'Help text',
  },
  pdf2txt: {
    title: 'Edit .pdf2txt',
    description: 'Update usage/help text shown when .pdf2txt is used without a replied PDF.',
    textLabel: 'Help text',
  },
  maketxt: {
    title: 'Edit .maketxt',
    description: 'Update usage/help text shown when .maketxt is used without any text.',
    textLabel: 'Usage/help text',
  },
  qrcode: {
    title: 'Edit .qrcode',
    description: 'Update usage/help text shown when .qrcode is used without any text/URL.',
    textLabel: 'Usage/help text',
  },
  imagetopdf: {
    title: 'Edit .imagetopdf',
    description: 'Update usage/help text shown when .imagetopdf is used without a replied image.',
    textLabel: 'Help text',
  },
  ss: {
    title: 'Edit .ss',
    description: 'Update usage/help text shown when .ss is used without a valid URL.',
    textLabel: 'Usage/help text',
  },
  tts: {
    title: 'Edit .tts',
    description: 'Update usage/help text shown when .tts is used without any text.',
    textLabel: 'Usage/help text',
  },
};

const SIMPLE_BUILTIN_COMMAND_KEYS = ['zip', 'unzip', 'pdf2txt', 'maketxt', 'qrcode', 'imagetopdf', 'ss', 'tts'];

function clearBuiltInEditorButtonRows() {
  if (!builtInEditorButtonRows) return;
  builtInEditorButtonRows.innerHTML = '';
}

function toInteractiveButton(inputButton = {}) {
  if (!inputButton || typeof inputButton !== 'object') return null;

  if (inputButton.name && inputButton.buttonParamsJson) {
    const name = String(inputButton.name || '').trim();
    if (!name) return null;

    let params = {};
    if (typeof inputButton.buttonParamsJson === 'string') {
      try {
        const parsed = JSON.parse(inputButton.buttonParamsJson);
        params = parsed && typeof parsed === 'object' ? parsed : {};
      } catch (error) {
        params = {};
      }
    } else if (inputButton.buttonParamsJson && typeof inputButton.buttonParamsJson === 'object') {
      params = inputButton.buttonParamsJson;
    }

    return {
      name,
      buttonParamsJson: JSON.stringify(params || {}),
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputButton, 'displayText')) {
    const displayText = String(inputButton.displayText || '').trim();
    if (!displayText) return null;
    const url = String(inputButton.url || '').trim();
    return {
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: displayText,
        url,
        merchant_url: url,
      }),
    };
  }

  return null;
}

function addBuiltInEditorButtonRow(button = null) {
  if (!builtInEditorButtonRows) return;
  const normalized = button ? toInteractiveButton(button) : null;
  builtInEditorButtonRows.appendChild(buttonRowTemplate(normalized || {}));
}

function collectBuiltInEditorButtons() {
  return collectButtonsFromRows(builtInEditorButtonRows, { allowEmptyUrl: true });
}

function closeBuiltInCommandModal() {
  activeBuiltInCommandKey = '';
  if (builtInCommandModal) {
    builtInCommandModal.hidden = true;
  }
  syncModalBodyScrollLock();
}

function openBuiltInCommandModal(commandKey) {
  const key = String(commandKey || '').trim().toLowerCase();
  if (!BUILT_IN_COMMAND_EDITOR_META[key]) return;

  activeBuiltInCommandKey = key;
  const meta = BUILT_IN_COMMAND_EDITOR_META[key];
  if (builtInEditorTitle) builtInEditorTitle.textContent = meta.title;
  if (builtInEditorDescription) builtInEditorDescription.textContent = meta.description;
  if (builtInEditorTextLabel) builtInEditorTextLabel.textContent = meta.textLabel;

  if (builtInEditorFeedback) {
    builtInEditorFeedback.textContent = '';
    builtInEditorFeedback.style.color = '#5d645d';
  }

  if (key === 'sch') {
    if (builtInEditorText) {
      builtInEditorText.value = String(builtInCommandSettings.scheduleUsageHelpText || '').trim() || DEFAULT_SCHEDULE_USAGE_HELP_TEXT;
    }
  } else if (key === 'schlist') {
    if (builtInEditorText) {
      builtInEditorText.value = String(builtInCommandSettings.scheduleListEmptyText || '').trim() || DEFAULT_SCHEDULE_LIST_EMPTY_TEXT;
    }
  } else if (key === 'schdel') {
    if (builtInEditorText) {
      builtInEditorText.value = String(builtInCommandSettings.scheduleDeleteUsageText || '').trim() || DEFAULT_SCHEDULE_DELETE_USAGE_TEXT;
    }
  } else if (key === 'vv') {
    if (builtInEditorText) {
      builtInEditorText.value = String(builtInCommandSettings.vvUsageHelpText || '').trim() || DEFAULT_VV_USAGE_HELP_TEXT;
    }
  } else if (key === 'sticker') {
    if (builtInEditorText) {
      builtInEditorText.value = String(builtInCommandSettings.stickerUsageHelpText || '').trim() || DEFAULT_STICKER_USAGE_HELP_TEXT;
    }
  } else if (SIMPLE_BUILTIN_COMMAND_KEYS.includes(key)) {
    const field = SIMPLE_BUILTIN_TEXT_FIELDS.find((item) => item.key === `${key}UsageHelpText`);
    if (builtInEditorText && field) {
      builtInEditorText.value = String(builtInCommandSettings[field.key] || '').trim() || field.fallback;
    }
  }

  if (builtInEditorButtonsSection) builtInEditorButtonsSection.hidden = false;
  clearBuiltInEditorButtonRows();

  const buttonsByKey = {
    sch: builtInCommandSettings.scheduleUsageButtons,
    schlist: builtInCommandSettings.scheduleListButtons,
    schdel: builtInCommandSettings.scheduleDeleteButtons,
    vv: builtInCommandSettings.vvUsageButtons,
    sticker: builtInCommandSettings.stickerUsageButtons,
  };
  SIMPLE_BUILTIN_TEXT_FIELDS.forEach((field) => {
    const simpleKey = field.key.replace(/UsageHelpText$/, '');
    buttonsByKey[simpleKey] = builtInCommandSettings[field.buttonsKey];
  });
  const activeButtons = Array.isArray(buttonsByKey[key]) ? buttonsByKey[key] : [];
  activeButtons.forEach((button) => addBuiltInEditorButtonRow(button));

  if (builtInCommandModal) {
    builtInCommandModal.hidden = false;
  }
  syncModalBodyScrollLock();
}

if (builtInEditorAddButtonBtn) {
  builtInEditorAddButtonBtn.addEventListener('click', () => {
    addBuiltInEditorButtonRow();
  });
}

document.querySelectorAll('.btn-edit-builtin-command').forEach((button) => {
  button.addEventListener('click', () => {
    openBuiltInCommandModal(button.dataset.builtinCommand || '');
  });
});

if (builtInEditorCancelBtn) {
  builtInEditorCancelBtn.addEventListener('click', closeBuiltInCommandModal);
}

if (closeBuiltInCommandModalBtn) {
  closeBuiltInCommandModalBtn.addEventListener('click', closeBuiltInCommandModal);
}

if (builtInCommandModal) {
  builtInCommandModal.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.closeModal === 'builtin-command') {
      closeBuiltInCommandModal();
    }
  });
}

if (builtInEditorSaveBtn) {
  builtInEditorSaveBtn.addEventListener('click', async () => {
    const key = activeBuiltInCommandKey;
    if (!key) return;

    const text = String(builtInEditorText?.value || '').trim();
    if (!text) {
      if (builtInEditorFeedback) {
        builtInEditorFeedback.textContent = 'Text tidak boleh kosong.';
        builtInEditorFeedback.style.color = '#b42318';
      }
      return;
    }

    const payload = {};
    if (key === 'sch') {
      const buttons = collectBuiltInEditorButtons();
      if (buttons.length > 10) {
        if (builtInEditorFeedback) {
          builtInEditorFeedback.textContent = 'Maksimum 10 button untuk .sch.';
          builtInEditorFeedback.style.color = '#b42318';
        }
        return;
      }
      payload.scheduleUsageHelpText = text;
      payload.scheduleUsageButtons = buttons;
    }

    if (key === 'schlist') {
      const buttons = collectBuiltInEditorButtons();
      if (buttons.length > 10) {
        if (builtInEditorFeedback) {
          builtInEditorFeedback.textContent = 'Maksimum 10 button untuk .schlist.';
          builtInEditorFeedback.style.color = '#b42318';
        }
        return;
      }
      payload.scheduleListEmptyText = text;
      payload.scheduleListButtons = buttons;
    }

    if (key === 'schdel') {
      const buttons = collectBuiltInEditorButtons();
      if (buttons.length > 10) {
        if (builtInEditorFeedback) {
          builtInEditorFeedback.textContent = 'Maksimum 10 button untuk .schdel.';
          builtInEditorFeedback.style.color = '#b42318';
        }
        return;
      }
      payload.scheduleDeleteUsageText = text;
      payload.scheduleDeleteButtons = buttons;
    }

    if (key === 'vv') {
      const buttons = collectBuiltInEditorButtons();
      if (buttons.length > 10) {
        if (builtInEditorFeedback) {
          builtInEditorFeedback.textContent = 'Maksimum 10 button untuk .vv.';
          builtInEditorFeedback.style.color = '#b42318';
        }
        return;
      }
      payload.vvUsageHelpText = text;
      payload.vvUsageButtons = buttons;
    }

    if (key === 'sticker') {
      const buttons = collectBuiltInEditorButtons();
      if (buttons.length > 10) {
        if (builtInEditorFeedback) {
          builtInEditorFeedback.textContent = 'Maksimum 10 button untuk .sticker.';
          builtInEditorFeedback.style.color = '#b42318';
        }
        return;
      }
      payload.stickerUsageHelpText = text;
      payload.stickerUsageButtons = buttons;
    }

    if (SIMPLE_BUILTIN_COMMAND_KEYS.includes(key)) {
      const field = SIMPLE_BUILTIN_TEXT_FIELDS.find((item) => item.key === `${key}UsageHelpText`);
      if (field) {
        const buttons = collectBuiltInEditorButtons();
        if (buttons.length > 10) {
          if (builtInEditorFeedback) {
            builtInEditorFeedback.textContent = `Maksimum 10 button untuk .${key}.`;
            builtInEditorFeedback.style.color = '#b42318';
          }
          return;
        }
        payload[field.key] = text;
        payload[field.buttonsKey] = buttons;
      }
    }

    setButtonLoading(builtInEditorSaveBtn, true, 'Saving built-in command');
    if (builtInEditorFeedback) {
      builtInEditorFeedback.textContent = 'Saving...';
      builtInEditorFeedback.style.color = '#5d645d';
    }

    try {
      const response = await fetch('/api/built-in-commands', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update built-in command');
      }

      builtInCommandSettings = normalizeBuiltInCommandSettings(data);
      applyBuiltInCommandSettingsUI();
      closeBuiltInCommandModal();
    } catch (error) {
      if (builtInEditorFeedback) {
        builtInEditorFeedback.textContent = error.message || 'Failed to update built-in command';
        builtInEditorFeedback.style.color = '#b42318';
      }
    } finally {
      setButtonLoading(builtInEditorSaveBtn, false);
    }
  });
}

applyBuiltInCommandSettingsUI();

if (commandPreviewModal) {
  commandPreviewModal.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.closeModal === 'command-preview') {
      closeCommandPreviewModal();
    }
  });
}

if (closeCommandPreviewModalBtn) {
  closeCommandPreviewModalBtn.addEventListener('click', closeCommandPreviewModal);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && destructiveConfirmModal && !destructiveConfirmModal.hidden) {
    closeDestructiveConfirmModal(false);
    return;
  }

  if (event.key === 'Escape' && commandPreviewModal && !commandPreviewModal.hidden) {
    closeCommandPreviewModal();
    return;
  }

  if (event.key === 'Escape' && builtInCommandModal && !builtInCommandModal.hidden) {
    closeBuiltInCommandModal();
    return;
  }

  if (event.key === 'Escape' && customCommandEditModal && !customCommandEditModal.hidden) {
    closeCustomCommandEditModal();
    return;
  }

  if (event.key === 'Escape') {
    closeCommandDetailPopovers();
  }

  if (event.key === 'Escape' && scheduleViewModal && !scheduleViewModal.hidden) {
    closeScheduleViewModal();
    return;
  }

  if (event.key === 'Escape' && buttonSetupGuideModal && !buttonSetupGuideModal.hidden) {
    closeButtonSetupGuideModal();
  }
});

const clearDeletedMessagesBtn = document.getElementById('clearDeletedMessagesBtn');
const deletedMessagesTableBody = document.getElementById('deleted-messages-table-body');

async function readApiErrorMessage(response, fallbackMessage) {
  try {
    const data = await response.json();
    return String(data?.error || '').trim() || fallbackMessage;
  } catch (error) {
    return fallbackMessage;
  }
}

function hasDeletedMessageRows() {
  if (!deletedMessagesTableBody) return false;
  return Array.from(deletedMessagesTableBody.querySelectorAll('tr')).some(
    (row) => row.dataset.id
  );
}

if (deletedMessagesTableBody) {
  deletedMessagesTableBody.addEventListener('click', async (event) => {
    const button = event.target instanceof Element
      ? event.target.closest('.btn-delete-deleted-message')
      : null;
    if (!button) return;

    const id = String(button.getAttribute('data-id') || '').trim();
    if (!id) return;

    const confirmDelete = await askDestructiveConfirm({
      title: 'Remove record?',
      description: 'This deleted message record will be removed permanently.',
      actionLabel: 'Remove',
    });
    if (!confirmDelete) return;

    setButtonLoading(button, true, 'Removing record');

    try {
      const response = await fetch(`/api/deleted-messages/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        const message = await readApiErrorMessage(response, 'Failed to remove record');
        throw new Error(message);
      }

      const row = button.closest('tr');
      if (row) row.remove();
      if (clearDeletedMessagesBtn) {
        clearDeletedMessagesBtn.disabled = !hasDeletedMessageRows();
      }

      if (!hasDeletedMessageRows()) {
        window.location.reload();
      }
    } catch (error) {
      window.alert(error.message);
      setButtonLoading(button, false);
    }
  });
}

if (clearDeletedMessagesBtn) {
  clearDeletedMessagesBtn.addEventListener('click', async () => {
    const confirmClear = await askDestructiveConfirm({
      title: 'Clear all deleted records?',
      description: 'This will permanently remove all deleted message records from the log.',
      actionLabel: 'Clear All',
    });
    if (!confirmClear) return;

    setButtonLoading(clearDeletedMessagesBtn, true, 'Clearing records');

    try {
      const response = await fetch('/api/deleted-messages', { method: 'DELETE' });
      if (!response.ok && response.status !== 204) {
        const message = await readApiErrorMessage(response, 'Failed to clear records');
        throw new Error(message);
      }

      window.location.reload();
    } catch (error) {
      window.alert(error.message);
      setButtonLoading(clearDeletedMessagesBtn, false);
    }
  });
}

updateCommandFormFlow();

// ── OSINT Panel ────────────────────────────────────────────────────────────

(function initOsintPanel() {
  const tabs = Array.from(document.querySelectorAll('.osint-section-tab'));
  const dropdownTrigger = document.getElementById('osintSectionDropdownTrigger');
  const dropdownLabel = document.getElementById('osintSectionDropdownLabel');
  const dropdownNav = document.getElementById('osintSectionNav');
  const panels = {
    'wa-lookup': document.getElementById('osint-wa-lookup'),
    'phone-info': document.getElementById('osint-phone-info'),
    'social-footprint': document.getElementById('osint-social-footprint'),
    'group-info': document.getElementById('osint-group-info'),
    'ip-domain': document.getElementById('osint-ip-domain'),
    'deep-scan': document.getElementById('osint-deep-scan'),
  };

  function showOsintTab(tab) {
    tabs.forEach((t) => {
      const isActive = t.dataset.osintTab === tab;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', String(isActive));
      if (isActive && dropdownLabel) dropdownLabel.textContent = t.textContent;
    });
    Object.keys(panels).forEach((key) => {
      if (panels[key]) panels[key].hidden = key !== tab;
    });
    if (dropdownNav) dropdownNav.classList.remove('open');
    if (dropdownTrigger) dropdownTrigger.setAttribute('aria-expanded', 'false');
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => showOsintTab(tab.dataset.osintTab));
  });

  if (dropdownTrigger && dropdownNav) {
    dropdownTrigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = dropdownNav.classList.contains('open');
      dropdownNav.classList.toggle('open', !isOpen);
      dropdownTrigger.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('click', (event) => {
      if (!dropdownNav.classList.contains('open')) return;
      if (dropdownNav.contains(event.target) || dropdownTrigger.contains(event.target)) return;
      dropdownNav.classList.remove('open');
      dropdownTrigger.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        dropdownNav.classList.remove('open');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── WA Lookup ──────────────────────────────────────────────────────────

  const waLookupBtn = document.getElementById('osintWaLookupBtn');
  const waPhoneInput = document.getElementById('osintWaPhone');
  const waFeedback = document.getElementById('osintWaFeedback');
  const waResult = document.getElementById('osintWaResult');
  const waBatchInput = document.getElementById('osintWaBatchInput');
  const waBatchLookupBtn = document.getElementById('osintWaBatchLookupBtn');
  const waBatchFeedback = document.getElementById('osintWaBatchFeedback');
  const waBatchResult = document.getElementById('osintWaBatchResult');
  const waBatchSummary = document.getElementById('osintWaBatchSummary');
  const waBatchTableBody = document.getElementById('osintWaBatchTableBody');

  if (waLookupBtn && waPhoneInput) {
    async function doWaLookup() {
      const phone = waPhoneInput.value.trim();
      if (!phone) {
        if (waFeedback) { waFeedback.textContent = 'Please enter a phone number.'; waFeedback.className = 'feedback is-error'; }
        return;
      }

      setButtonLoading(waLookupBtn, true, 'Looking up…');
      if (waFeedback) { waFeedback.textContent = ''; waFeedback.className = 'feedback'; }
      if (waResult) waResult.hidden = true;

      try {
        const res = await fetch('/api/osint/wa-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Lookup failed');
        }

        // Populate result
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };

        set('osintWaNumber', data.phone || '—');
        set('osintWaExists', data.exists ? '✓ Yes — registered on WhatsApp' : '✗ No — not found on WhatsApp');
        set('osintWaJid', data.jid || '—');
        set('osintWaStatus', data.status || 'Hidden / Not set');
        set('osintWaPicStatus', data.profilePicStatus || '—');

        const badge = document.getElementById('osintWaStatusBadge');
        if (badge) {
          badge.textContent = data.exists ? 'Found' : 'Not found';
          badge.className = `badge ${data.exists ? 'badge-exists' : 'badge-not-exists'}`;
        }

        const avatar = document.getElementById('osintWaAvatar');
        const avatarFallback = document.getElementById('osintWaAvatarFallback');
        if (avatar && avatarFallback) {
          if (data.profilePicUrl) {
            avatar.src = data.profilePicUrl;
            avatar.alt = `Profile picture for ${data.phone || phone}`;
            avatar.hidden = false;
            avatarFallback.hidden = true;
          } else {
            avatar.hidden = true;
            avatar.removeAttribute('src');
            avatar.alt = 'Profile picture not available';
            avatarFallback.textContent = (data.phone || phone).slice(-2) || '?';
            avatarFallback.hidden = false;
          }
        }

        if (waResult) waResult.hidden = false;
      } catch (error) {
        if (waFeedback) { waFeedback.textContent = error.message; waFeedback.className = 'feedback is-error'; }
      } finally {
        setButtonLoading(waLookupBtn, false);
      }
    }

    waLookupBtn.addEventListener('click', doWaLookup);
    waPhoneInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doWaLookup(); });
  }

  if (waBatchLookupBtn && waBatchInput) {
    async function doWaBatchLookup() {
      const lines = String(waBatchInput.value || '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (!lines.length) {
        if (waBatchFeedback) {
          waBatchFeedback.textContent = 'Please provide at least one phone number.';
          waBatchFeedback.className = 'feedback is-error';
        }
        return;
      }

      if (lines.length > 25) {
        if (waBatchFeedback) {
          waBatchFeedback.textContent = 'Maximum 25 numbers per batch request.';
          waBatchFeedback.className = 'feedback is-error';
        }
        return;
      }

      setButtonLoading(waBatchLookupBtn, true, 'Running batch check…');
      if (waBatchFeedback) {
        waBatchFeedback.textContent = '';
        waBatchFeedback.className = 'feedback';
      }
      if (waBatchResult) waBatchResult.hidden = true;

      try {
        const res = await fetch('/api/osint/wa-lookup-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ numbers: lines }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Batch lookup failed');
        }

        if (waBatchSummary) {
          const found = Number(data.found || 0);
          const notFound = Number(data.notFound || 0);
          const invalid = Number(data.invalid || 0);
          const error = Number(data.error || 0);
          waBatchSummary.textContent = `Checked ${Number(data.checked || 0)} / ${Number(data.total || 0)} | Found: ${found} | Not Found: ${notFound} | Invalid: ${invalid} | Error: ${error}`;
        }

        if (waBatchTableBody) {
          waBatchTableBody.innerHTML = '';
          const rows = Array.isArray(data.results) ? data.results : [];

          rows.forEach((row, index) => {
            const tr = document.createElement('tr');

            const tdNo = document.createElement('td');
            tdNo.textContent = String(index + 1);

            const tdInput = document.createElement('td');
            tdInput.textContent = String(row.input || '—');

            const tdPhone = document.createElement('td');
            tdPhone.textContent = String(row.phone || '—');
            tdPhone.className = 'osint-mono';

            const tdStatus = document.createElement('td');
            const badge = document.createElement('span');
            badge.className = 'badge badge-outline';
            if (row.status === 'found') {
              badge.textContent = 'Found';
            } else if (row.status === 'not_found') {
              badge.textContent = 'Not Found';
            } else if (row.status === 'invalid') {
              badge.textContent = 'Invalid';
            } else {
              badge.textContent = 'Error';
            }
            tdStatus.appendChild(badge);

            const tdJid = document.createElement('td');
            tdJid.textContent = String(row.jid || row.error || '—');
            tdJid.className = 'osint-mono';

            tr.appendChild(tdNo);
            tr.appendChild(tdInput);
            tr.appendChild(tdPhone);
            tr.appendChild(tdStatus);
            tr.appendChild(tdJid);

            waBatchTableBody.appendChild(tr);
          });
        }

        if (waBatchResult) waBatchResult.hidden = false;
      } catch (error) {
        if (waBatchFeedback) {
          waBatchFeedback.textContent = error.message;
          waBatchFeedback.className = 'feedback is-error';
        }
      } finally {
        setButtonLoading(waBatchLookupBtn, false);
      }
    }

    waBatchLookupBtn.addEventListener('click', doWaBatchLookup);
    waBatchInput.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        doWaBatchLookup();
      }
    });
  }

  // ── Phone Info ──────────────────────────────────────────────────────────

  const phoneLookupBtn = document.getElementById('osintPhoneLookupBtn');
  const phoneInput = document.getElementById('osintPhoneNumber');
  const phoneFeedback = document.getElementById('osintPhoneFeedback');
  const phoneResult = document.getElementById('osintPhoneResult');

  if (phoneLookupBtn && phoneInput) {
    async function doPhoneLookup() {
      const number = phoneInput.value.trim();
      if (!number) {
        if (phoneFeedback) { phoneFeedback.textContent = 'Please enter a phone number.'; phoneFeedback.className = 'feedback is-error'; }
        return;
      }

      setButtonLoading(phoneLookupBtn, true, 'Looking up…');
      if (phoneFeedback) { phoneFeedback.textContent = ''; phoneFeedback.className = 'feedback'; }
      if (phoneResult) phoneResult.hidden = true;

      try {
        const res = await fetch(`/api/osint/phone-info?number=${encodeURIComponent(number)}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Lookup failed');

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };
        set('osintPhoneValid', data.valid ? '✓ Format sah' : '✗ Format tidak sah');
        set('osintPhoneCountry', data.country || '—');
        set('osintPhoneCountryCode', data.countryCode || '—');
        set('osintPhoneLocal', data.localFormat || '—');
        set('osintPhoneIntl', data.intlFormat || '—');
        set('osintPhoneCarrier', data.carrier || '—');
        set('osintPhoneLineType', data.lineType || '—');
        set('osintPhoneTimezone', data.timezone || '—');
        set('osintPhoneLocalTime', data.localTime || '—');

        if (phoneResult) phoneResult.hidden = false;
      } catch (error) {
        if (phoneFeedback) { phoneFeedback.textContent = error.message; phoneFeedback.className = 'feedback is-error'; }
      } finally {
        setButtonLoading(phoneLookupBtn, false);
      }
    }

    phoneLookupBtn.addEventListener('click', doPhoneLookup);
    phoneInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doPhoneLookup(); });
  }

  // ── Social Footprint ────────────────────────────────────────────────────

  const socialLookupBtn = document.getElementById('osintSocialLookupBtn');
  const socialPhoneInput = document.getElementById('osintSocialPhone');
  const socialFeedback = document.getElementById('osintSocialFeedback');
  const socialResult = document.getElementById('osintSocialResult');
  const socialLinksBody = document.getElementById('osintSocialLinksBody');

  if (socialLookupBtn && socialPhoneInput) {
    async function doSocialLookup() {
      const phone = String(socialPhoneInput.value || '').trim();
      if (!phone) {
        if (socialFeedback) {
          socialFeedback.textContent = 'Please enter a phone number.';
          socialFeedback.className = 'feedback is-error';
        }
        return;
      }

      setButtonLoading(socialLookupBtn, true, 'Generating links…');
      if (socialFeedback) {
        socialFeedback.textContent = '';
        socialFeedback.className = 'feedback';
      }
      if (socialResult) socialResult.hidden = true;

      try {
        const res = await fetch(`/api/osint/social-footprint?phone=${encodeURIComponent(phone)}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Social footprint lookup failed');
        }

        const set = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.textContent = val ?? '—';
        };

        set('osintSocialNormalized', data.phone || '—');
        set('osintSocialIntl', data.intlFormat || '—');
        set('osintSocialCountry', data.country || 'Unknown');

        if (socialLinksBody) {
          socialLinksBody.innerHTML = '';
          const categories = Array.isArray(data.categories) ? data.categories : [];
          if (categories.length) {
            categories.forEach((cat) => {
              const sec = document.createElement('div');
              sec.className = 'deep-scan-link-category';
              const title = document.createElement('p');
              title.className = 'deep-scan-link-cat-title';
              title.textContent = cat.name;
              sec.appendChild(title);
              const chips = document.createElement('div');
              chips.className = 'deep-scan-link-chips';
              (cat.links || []).forEach((item) => {
                const a = document.createElement('a');
                a.href = String(item.url || '#');
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.className = 'deep-scan-link-chip';
                a.textContent = String(item.platform || 'Link');
                chips.appendChild(a);
              });
              sec.appendChild(chips);
              socialLinksBody.appendChild(sec);
            });
          } else {
            // fallback: flat links
            (data.links || []).forEach((item) => {
              const a = document.createElement('a');
              a.href = String(item.url || '#');
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              a.className = 'deep-scan-link-chip';
              a.textContent = String(item.platform || 'Link');
              socialLinksBody.appendChild(a);
            });
          }
        }

        if (socialResult) socialResult.hidden = false;
      } catch (error) {
        if (socialFeedback) {
          socialFeedback.textContent = error.message;
          socialFeedback.className = 'feedback is-error';
        }
      } finally {
        setButtonLoading(socialLookupBtn, false);
      }
    }

    socialLookupBtn.addEventListener('click', doSocialLookup);
    socialPhoneInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') doSocialLookup();
    });
  }

  // ── Group Info ──────────────────────────────────────────────────────────

  const groupLookupBtn = document.getElementById('osintGroupLookupBtn');
  const groupIdInput = document.getElementById('osintGroupId');
  const groupFeedback = document.getElementById('osintGroupFeedback');
  const groupResult = document.getElementById('osintGroupResult');

  if (groupLookupBtn && groupIdInput) {
    let allParticipants = [];
    let adminParticipants = [];
    let currentMemberTab = 'all';

    function renderMemberTable(participants) {
      const tbody = document.getElementById('osintGroupMembersList');
      if (!tbody) return;
      tbody.innerHTML = participants.map((p, i) => `
        <tr>
          <td>${i + 1}</td>
          <td class="osint-mono">${p.jid}</td>
          <td><span class="badge badge-outline">${p.admin ? (p.admin === 'superadmin' ? 'Owner' : 'Admin') : 'Member'}</span></td>
        </tr>`).join('');
    }

    const memberTabs = document.querySelectorAll('.osint-members-tab');
    memberTabs.forEach((t) => {
      t.addEventListener('click', () => {
        memberTabs.forEach((x) => x.classList.remove('active'));
        t.classList.add('active');
        currentMemberTab = t.dataset.membersTab;
        renderMemberTable(currentMemberTab === 'admins' ? adminParticipants : allParticipants);
      });
    });

    async function doGroupLookup() {
      const id = groupIdInput.value.trim();
      if (!id) {
        if (groupFeedback) { groupFeedback.textContent = 'Please enter a group ID.'; groupFeedback.className = 'feedback is-error'; }
        return;
      }

      setButtonLoading(groupLookupBtn, true, 'Looking up…');
      if (groupFeedback) { groupFeedback.textContent = ''; groupFeedback.className = 'feedback'; }
      if (groupResult) groupResult.hidden = true;

      try {
        const res = await fetch(`/api/osint/group-info?id=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Lookup failed');

        const set = (id2, val) => { const el = document.getElementById(id2); if (el) el.textContent = val ?? '—'; };
        set('osintGroupName', data.name);
        set('osintGroupJid', data.id);
        set('osintGroupDesc', data.description || 'No description');
        set('osintGroupOwner', data.owner || '—');
        set('osintGroupCreated', data.createdAt ? new Date(data.createdAt).toLocaleString() : '—');
        set('osintGroupMemberCount', data.memberCount);
        set('osintGroupAdminCount', data.adminCount);

        allParticipants = data.participants || [];
        adminParticipants = allParticipants.filter((p) => p.admin);

        const allCount = document.getElementById('osintMembersAllCount');
        const adminCount = document.getElementById('osintMembersAdminCount');
        if (allCount) allCount.textContent = allParticipants.length;
        if (adminCount) adminCount.textContent = adminParticipants.length;

        const membersSection = document.getElementById('osintGroupMembersSection');
        if (membersSection) {
          membersSection.hidden = false;
          renderMemberTable(allParticipants);
        }

        if (groupResult) groupResult.hidden = false;
      } catch (error) {
        if (groupFeedback) { groupFeedback.textContent = error.message; groupFeedback.className = 'feedback is-error'; }
      } finally {
        setButtonLoading(groupLookupBtn, false);
      }
    }

    groupLookupBtn.addEventListener('click', doGroupLookup);
    groupIdInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doGroupLookup(); });
  }

  // ── IP / Domain Lookup ──────────────────────────────────────────────────

  const ipLookupBtn = document.getElementById('osintIpLookupBtn');
  const ipQueryInput = document.getElementById('osintIpQuery');
  const ipFeedback = document.getElementById('osintIpFeedback');
  const ipResult = document.getElementById('osintIpResult');

  if (ipLookupBtn && ipQueryInput) {
    async function doIpLookup() {
      const query = ipQueryInput.value.trim();
      if (!query) {
        if (ipFeedback) { ipFeedback.textContent = 'Please enter an IP or domain.'; ipFeedback.className = 'feedback is-error'; }
        return;
      }

      setButtonLoading(ipLookupBtn, true, 'Looking up…');
      if (ipFeedback) { ipFeedback.textContent = ''; ipFeedback.className = 'feedback'; }
      if (ipResult) ipResult.hidden = true;

      try {
        const res = await fetch(`/api/osint/ip-info?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!res.ok || data.success === false) throw new Error(data.error || 'Lookup failed');

        const set = (id2, val) => { const el = document.getElementById(id2); if (el) el.textContent = val ?? '—'; };
        set('osintIpAddress', data.query || '—');
        set('osintIpHostname', data.hostname || '—');
        set('osintIpCountry', data.country || '—');
        set('osintIpRegion', data.region || '—');
        set('osintIpCity', data.city || '—');
        set('osintIpPostal', data.postal || '—');
        set('osintIpCoords', data.coordinates || '—');
        set('osintIpTimezone', data.timezone || '—');
        set('osintIpOrg', data.org || '—');
        set('osintIpAs', data.as || '—');

        if (ipResult) ipResult.hidden = false;
      } catch (error) {
        if (ipFeedback) { ipFeedback.textContent = error.message; ipFeedback.className = 'feedback is-error'; }
      } finally {
        setButtonLoading(ipLookupBtn, false);
      }
    }

    ipLookupBtn.addEventListener('click', doIpLookup);
    ipQueryInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doIpLookup(); });
  }

  // ── Deep Scan ───────────────────────────────────────────────────────────

  const deepScanBtn = document.getElementById('osintDeepScanBtn');
  const deepScanInput = document.getElementById('osintDeepScanPhone');
  const deepScanFeedback = document.getElementById('osintDeepScanFeedback');
  const deepScanResult = document.getElementById('osintDeepScanResult');
  const deepScanLinks = document.getElementById('osintDeepScanLinks');

  if (deepScanBtn && deepScanInput) {
    async function doDeepScan() {
      const phone = String(deepScanInput.value || '').trim();
      if (!phone) {
        if (deepScanFeedback) { deepScanFeedback.textContent = 'Sila masukkan nombor telefon.'; deepScanFeedback.className = 'feedback is-error'; }
        return;
      }

      setButtonLoading(deepScanBtn, true, 'Mengimbas…');
      if (deepScanFeedback) { deepScanFeedback.textContent = ''; deepScanFeedback.className = 'feedback'; }
      if (deepScanResult) deepScanResult.hidden = true;

      try {
        const res = await fetch('/api/osint/deep-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Deep scan gagal');

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };

        // Phone info
        const pi = data.phoneInfo || {};
        set('dsCountry', pi.country || '—');
        set('dsCountryCode', pi.countryCode || '—');
        set('dsIntl', pi.intlFormat || '—');
        set('dsLocal', pi.localFormat || '—');
        set('dsCarrier', pi.carrier || '—');
        set('dsLineType', pi.lineType || '—');
        set('dsTimezone', pi.timezone || '—');
        set('dsLocalTime', pi.localTime || '—');

        // WA info
        const wa = data.waInfo || {};
        if (wa.error) {
          set('dsWaExists', `⚠ ${wa.error}`);
          set('dsWaStatus', '—');
          set('dsWaPic', '—');
        } else {
          set('dsWaExists', wa.exists === true ? '✓ Ya — ada di WhatsApp' : wa.exists === false ? '✗ Tidak — tiada di WhatsApp' : '—');
          set('dsWaStatus', wa.status || 'Tiada status');
          set('dsWaPic', wa.profilePicStatus || '—');
        }

        // Platform links
        if (deepScanLinks) {
          deepScanLinks.innerHTML = '';
          const social = data.social || {};
          const categories = Array.isArray(social.categories) ? social.categories : [];
          categories.forEach((cat) => {
            const sec = document.createElement('div');
            sec.className = 'deep-scan-link-category';
            const title = document.createElement('p');
            title.className = 'deep-scan-link-cat-title';
            title.textContent = cat.name;
            sec.appendChild(title);
            const chips = document.createElement('div');
            chips.className = 'deep-scan-link-chips';
            (cat.links || []).forEach((item) => {
              const a = document.createElement('a');
              a.href = String(item.url || '#');
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              a.className = 'deep-scan-link-chip';
              a.textContent = String(item.platform || 'Link');
              chips.appendChild(a);
            });
            sec.appendChild(chips);
            deepScanLinks.appendChild(sec);
          });
        }

        if (deepScanResult) deepScanResult.hidden = false;
      } catch (error) {
        if (deepScanFeedback) { deepScanFeedback.textContent = error.message; deepScanFeedback.className = 'feedback is-error'; }
      } finally {
        setButtonLoading(deepScanBtn, false);
      }
    }

    deepScanBtn.addEventListener('click', doDeepScan);
    deepScanInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doDeepScan(); });
  }
})();

// ── Deleted Messages Search / Filter ──────────────────────────────────────

(function initDeletedMsgsFilter() {
  const searchInput = document.getElementById('deletedMsgsSearch');
  const typeFilter = document.getElementById('deletedMsgsTypeFilter');
  const chatFilter = document.getElementById('deletedMsgsChatFilter');
  const tbody = document.getElementById('deleted-messages-table-body');

  if (!tbody) return;

  function applyFilters() {
    const search = (searchInput ? searchInput.value.toLowerCase() : '');
    const type = (typeFilter ? typeFilter.value : '');
    const chat = (chatFilter ? chatFilter.value : '');

    const rows = Array.from(tbody.querySelectorAll('tr[data-id]'));
    let visible = 0;

    rows.forEach((row) => {
      const searchText = (row.dataset.search || '').toLowerCase();
      const rowType = (row.dataset.type || '').toLowerCase();
      const rowChat = (row.dataset.chat || '').toLowerCase();

      const matchesSearch = !search || searchText.includes(search);
      const matchesType = !type || rowType === type;
      const matchesChat = !chat || rowChat === chat;

      const show = matchesSearch && matchesType && matchesChat;
      row.hidden = !show;
      if (show) visible++;
    });

    // Show/hide empty state
    let emptyRow = tbody.querySelector('.dm-empty-row');
    if (visible === 0 && rows.length > 0) {
      if (!emptyRow) {
        emptyRow = document.createElement('tr');
        emptyRow.className = 'dm-empty-row';
        emptyRow.innerHTML = `<td colspan="2" class="muted" style="text-align:center;padding:32px;">No records match your filter</td>`;
        tbody.appendChild(emptyRow);
      }
      emptyRow.hidden = false;
    } else if (emptyRow) {
      emptyRow.hidden = true;
    }
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (typeFilter) typeFilter.addEventListener('change', applyFilters);
  if (chatFilter) chatFilter.addEventListener('change', applyFilters);
})();

// ── Deleted Message Viewer Modal ───────────────────────────────────────────

(function initDmViewModal() {
  const AVATAR_COLORS = ['#f56b6b', '#f2a541', '#e0b93f', '#6bc46d', '#4db6ac', '#4fa8e0', '#7e8ce0', '#a76bd6', '#d66bb0'];

  function getInitials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0][0] || '';
    const second = parts.length > 1 ? parts[1][0] : '';
    return (first + second).toUpperCase();
  }

  function getAvatarColor(name) {
    const str = String(name || '');
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  function setupModal() {
    const backdrop = document.getElementById('dmViewModalBackdrop');
    const closeBtn = document.getElementById('dmViewModalClose');
    const avatarEl = document.getElementById('dmViewModalAvatar');
    const titleEl = document.getElementById('dmViewModalTitle');
    const subtitleEl = document.getElementById('dmViewModalSubtitle');
    const bubbleWrap = document.getElementById('dmViewBubbleWrap');
    const metaGrid = document.getElementById('dmViewMetaGrid');

    if (!backdrop || !closeBtn || !titleEl || !subtitleEl || !bubbleWrap || !metaGrid) return;
    if (backdrop.dataset.bound === '1') return;
    backdrop.dataset.bound = '1';

    function openModal(btn) {
      const sender = btn.dataset.sender || 'Unknown';
      const chat = btn.dataset.chat || '—';
      const isGroup = btn.dataset.isGroup === '1';
      const type = btn.dataset.type || 'text';
      const text = btn.dataset.text ? decodeURIComponent(btn.dataset.text) : '';
      const mediaUrl = btn.dataset.mediaUrl || '';
      const fileName = btn.dataset.fileName || '';
      const mime = btn.dataset.mime || '';
      const sentAt = btn.dataset.sentAt || '';
      const deletedAt = btn.dataset.deletedAt || '';

    // Header
    titleEl.textContent = isGroup ? chat : chat || sender;
    subtitleEl.textContent = `Deleted by ${sender}`;
    if (avatarEl) {
      const avatarLabel = isGroup ? chat : sender;
      avatarEl.textContent = getInitials(avatarLabel);
      avatarEl.style.background = getAvatarColor(avatarLabel);
    }

    // Build bubble
    bubbleWrap.innerHTML = '';

    const senderLabel = document.createElement('span');
    senderLabel.className = 'dm-bubble-sender';
    senderLabel.textContent = sender;
    bubbleWrap.appendChild(senderLabel);

    const bubble = document.createElement('div');
    bubble.className = 'dm-bubble';

    // Media / attachment
    if (mediaUrl) {
      const isImage = type === 'image' || /^image\//i.test(mime);
      const isVideo = type === 'video' || /^video\//i.test(mime);
      const isAudio = type === 'audio' || /^audio\//i.test(mime);

      if (isImage) {
        const imgWrap = document.createElement('a');
        imgWrap.className = 'dm-image-preview dm-image-preview-link';
        imgWrap.href = mediaUrl;
        imgWrap.target = '_blank';
        imgWrap.rel = 'noopener';
        const img = document.createElement('img');
        img.src = mediaUrl;
        img.alt = fileName || 'Image';
        imgWrap.appendChild(img);
        bubble.appendChild(imgWrap);
      } else {
        // Generic attachment card
        const iconSvg = isVideo
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>'
          : isAudio
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';

        const dlSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';

        const card = document.createElement('a');
        card.className = 'dm-attachment';
        card.href = mediaUrl;
        card.target = '_blank';
        card.rel = 'noopener';
        card.innerHTML = `
          <div class="dm-attachment-icon">${iconSvg}</div>
          <div class="dm-attachment-info">
            <div class="dm-attachment-name">${fileName || type.charAt(0).toUpperCase() + type.slice(1) + ' file'}</div>
            <div class="dm-attachment-desc">${mime || type} · Tap to open</div>
          </div>
          <div class="dm-attachment-action">${dlSvg}</div>`;
        bubble.appendChild(card);
      }
    }

    // Text / caption
    if (text) {
      const p = document.createElement('p');
      p.className = 'dm-bubble-text';
      p.textContent = text;
      bubble.appendChild(p);
    }

    if (!mediaUrl && !text) {
      const p = document.createElement('p');
      p.className = 'dm-bubble-text';
      p.style.color = 'var(--muted-foreground)';
      p.style.fontStyle = 'italic';
      p.textContent = `[${type} — no content captured]`;
      bubble.appendChild(p);
    }

    // Sent time in bubble
    if (sentAt) {
      const t = document.createElement('div');
      t.className = 'dm-bubble-time';
      t.textContent = new Date(sentAt).toLocaleString();
      bubble.appendChild(t);
    }

    bubbleWrap.appendChild(bubble);

    // Deleted notice — shown as a small chip below the bubble, like a system note
    const notice = document.createElement('div');
    notice.className = 'dm-bubble-deleted-notice';
    notice.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path></svg> This message was deleted`;
    bubbleWrap.appendChild(notice);

    // Meta footer
    const rows = [
      ['Chat', chat],
      ['Sender', sender],
      ['Type', type],
      ['Sent at', sentAt ? new Date(sentAt).toLocaleString() : '—'],
      ['Deleted at', deletedAt ? new Date(deletedAt).toLocaleString() : '—'],
    ];
    metaGrid.innerHTML = rows.map(([label, val]) => `
      <span class="dm-view-meta-label">${label}</span>
      <span class="dm-view-meta-value">${val}</span>`).join('');

      backdrop.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      backdrop.hidden = true;
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !backdrop.hidden) closeModal(); });

    // Delegate clicks on View buttons in the table
    const tbody = document.getElementById('deleted-messages-table-body');
    if (tbody) {
      tbody.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-view-deleted-message');
        if (btn) openModal(btn);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupModal, { once: true });
  } else {
    setupModal();
  }
})();
