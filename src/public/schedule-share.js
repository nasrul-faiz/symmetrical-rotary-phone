const form = document.getElementById('publicScheduleForm');
const themeToggleBtn = document.getElementById('shareThemeToggleBtn');
const scheduleRepeatTypeInput = document.getElementById('publicScheduleRepeatType');
const scheduleAtInput = document.getElementById('publicScheduleAt');
const scheduleRepeatDaysField = document.getElementById('publicScheduleRepeatDaysField');
const scheduleRepeatDaysPicker = document.getElementById('publicScheduleRepeatDaysPicker');
const scheduleRepeatDaysTrigger = document.getElementById('publicScheduleRepeatDaysTrigger');
const scheduleRepeatDaysTriggerLabel = document.getElementById('publicScheduleRepeatDaysTriggerLabel');
const scheduleRepeatDaysPopover = document.getElementById('publicScheduleRepeatDaysPopover');
const scheduleRepeatDaysDoneBtn = document.getElementById('publicScheduleRepeatDaysDoneBtn');
const scheduleSendTimeField = document.getElementById('publicScheduleSendTimeField');
const scheduleMediaTypeField = document.getElementById('publicScheduleMediaTypeField');
const scheduleMediaTypeInput = document.getElementById('publicScheduleMediaType');
const scheduleMediaFields = document.getElementById('public-schedule-media-fields');
const scheduleMediaSourceInput = document.getElementById('publicScheduleMediaSource');
const scheduleMediaSourceField = document.getElementById('publicScheduleMediaSourceField');
const scheduleMediaSourceTabs = Array.from(document.querySelectorAll('[data-public-schedule-media-source]'));
const scheduleMediaUrlField = document.getElementById('publicScheduleMediaUrlField');
const scheduleMediaUrlInput = document.getElementById('publicScheduleMediaUrl');
const scheduleMediaUploadField = document.getElementById('publicScheduleMediaUploadField');
const scheduleMediaUploadInput = document.getElementById('publicScheduleMediaUpload');
const scheduleFileNameField = document.getElementById('publicScheduleFileNameField');
const scheduleFileNameInput = document.getElementById('publicScheduleFileName');
const scheduleAddButtonRowBtn = document.getElementById('publicScheduleAddButtonRowBtn');
const scheduleButtonRows = document.getElementById('publicScheduleButtonRows');
const scheduleTargetStep = document.getElementById('publicScheduleTargetStep');
const targetTypeInput = document.getElementById('publicTargetType');
const targetValueField = document.getElementById('publicTargetValueField');
const targetValueLabel = document.getElementById('publicTargetValueLabel');
const targetHint = document.getElementById('publicTargetHint');
const groupTools = document.getElementById('publicGroupTools');
const groupPicker = document.getElementById('publicGroupPicker');
const groupFetchHint = document.getElementById('publicGroupFetchHint');
const refreshGroupsBtn = document.getElementById('publicRefreshGroupsBtn');
const personalChatTools = document.getElementById('publicPersonalChatTools');
const personalChatPicker = document.getElementById('publicPersonalChatPicker');
const personalChatFetchHint = document.getElementById('publicPersonalChatFetchHint');
const refreshPersonalChatsBtn = document.getElementById('publicRefreshPersonalChatsBtn');
const feedback = document.getElementById('publicScheduleFeedback');
const submitBtn = document.getElementById('publicScheduleSubmitBtn');

let hasLoadedGroups = false;
let hasLoadedPersonalChats = false;
const THEME_STORAGE_KEY = 'schedulebot-theme';
const TIMEZONE_STORAGE_KEY = 'schedulebot-timezone';

function applyTheme(theme) {
  const normalized = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', normalized);
  document.documentElement.style.colorScheme = normalized;
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
  const initialTheme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : (prefersLightMode ? 'light' : 'dark');
  applyTheme(initialTheme);
}

function setButtonLoading(button, isLoading, loadingLabel) {
  if (!button) return;

  if (isLoading) {
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = button.textContent || '';
    }
    if (loadingLabel) {
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
  button.removeAttribute('aria-label');
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

function isSupportedTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: String(timeZone || '').trim() }).format(new Date());
    return true;
  } catch (error) {
    return false;
  }
}

function getSelectedTimeZone() {
  const stored = readStoredTimeZone();
  if (stored && isSupportedTimeZone(stored)) return stored;

  const browserTz = getDefaultTimeZone();
  return isSupportedTimeZone(browserTz) ? browserTz : 'UTC';
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

function normalizeMediaSourceValue(value) {
  return String(value || '').trim() === 'upload' ? 'upload' : 'url';
}

function buildScheduleButtonRow(button = {}) {
  const row = document.createElement('div');
  row.className = 'button-row';

  let params = {};
  if (typeof button.buttonParamsJson === 'string') {
    try {
      const parsed = JSON.parse(button.buttonParamsJson);
      params = parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      params = {};
    }
  } else if (button.buttonParamsJson && typeof button.buttonParamsJson === 'object') {
    params = button.buttonParamsJson;
  }

  const buttonType = String(button.name || 'quick_reply').trim() || 'quick_reply';

  row.innerHTML = `
    <select class="btn-type-select">
      <option value="quick_reply">Quick Reply</option>
      <option value="cta_url">Open Link</option>
      <option value="cta_call">Call</option>
      <option value="cta_wa">WhatsApp</option>
      <option value="cta_copy">Copy Code</option>
    </select>
    <input class="btn-label-input" placeholder="Button label" />
    <input class="btn-value-input" placeholder="Value (id / URL / phone)" />
    <button type="button" class="btn btn-ghost btn-sm btn-remove-row" aria-label="Remove button">&times;</button>
  `;

  const typeSelect = row.querySelector('.btn-type-select');
  const labelInput = row.querySelector('.btn-label-input');
  const valueInput = row.querySelector('.btn-value-input');
  const removeBtn = row.querySelector('.btn-remove-row');

  typeSelect.value = buttonType;
  labelInput.value = String(params.display_text || '').trim();
  valueInput.value = String(params.id || params.url || params.phone_number || params.copy_code || '').trim();

  function syncPlaceholder() {
    const type = String(typeSelect.value || 'quick_reply').trim();
    if (type === 'cta_url') {
      valueInput.placeholder = 'https://example.com';
    } else if (type === 'cta_call') {
      valueInput.placeholder = '+60123456789';
    } else if (type === 'cta_wa') {
      valueInput.placeholder = '60123456789';
    } else if (type === 'cta_copy') {
      valueInput.placeholder = 'DISKAUN10';
    } else {
      valueInput.placeholder = 'reply_id';
    }
  }

  syncPlaceholder();
  typeSelect.addEventListener('change', syncPlaceholder);
  removeBtn.addEventListener('click', () => row.remove());

  return row;
}

function addScheduleButtonRow(button = {}) {
  if (!scheduleButtonRows) return;
  scheduleButtonRows.appendChild(buildScheduleButtonRow(button));
}

function collectScheduleButtons() {
  if (!scheduleButtonRows) return [];

  return Array.from(scheduleButtonRows.querySelectorAll('.button-row'))
    .map((row) => {
      const type = String(row.querySelector('.btn-type-select')?.value || '').trim();
      const label = String(row.querySelector('.btn-label-input')?.value || '').trim();
      const value = String(row.querySelector('.btn-value-input')?.value || '').trim();

      if (!type || !label || !value) return null;

      const params = { display_text: label };
      if (type === 'cta_url') {
        params.url = value;
        params.merchant_url = value;
      } else if (type === 'cta_call' || type === 'cta_wa') {
        params.phone_number = value;
      } else if (type === 'cta_copy') {
        params.copy_code = value;
      } else {
        params.id = value;
      }

      return {
        name: type,
        buttonParamsJson: JSON.stringify(params),
      };
    })
    .filter(Boolean);
}

function syncScheduleMediaSourceTabs() {
  const selectedSource = normalizeMediaSourceValue(scheduleMediaSourceInput?.value || 'url');

  scheduleMediaSourceTabs.forEach((tab) => {
    const tabSource = normalizeMediaSourceValue(tab.dataset.publicScheduleMediaSource || 'url');
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

function syncTargetInputContent() {
  if (!targetTypeInput || !targetValueField || !targetValueLabel || !targetHint) return;

  if (scheduleTargetStep?.hidden) {
    if (groupTools) groupTools.hidden = true;
    if (personalChatTools) personalChatTools.hidden = true;
    return;
  }

  if (targetTypeInput.value === 'group') {
    targetValueField.hidden = false;
    targetValueLabel.textContent = 'Group ID (example: 1203630xxxx@g.us)';
    targetHint.textContent = 'You can enter 1203630xxxx only or with @g.us suffix';
    if (groupTools) groupTools.hidden = false;
    if (personalChatTools) personalChatTools.hidden = true;
    loadGroups();
    return;
  }

  targetValueField.hidden = false;
  targetValueLabel.textContent = 'Personal ID / Number (example: 62812xxxx@s.whatsapp.net)';
  targetHint.textContent = 'You can enter phone number only or with @s.whatsapp.net suffix';
  if (groupTools) groupTools.hidden = true;
  if (personalChatTools) personalChatTools.hidden = false;
  loadPersonalChats();
}

function setGroupHint(text, color = '#5d645d') {
  if (!groupFetchHint) return;
  groupFetchHint.textContent = text;
  groupFetchHint.style.color = color;
}

function setPersonalChatHint(text, color = '#5d645d') {
  if (!personalChatFetchHint) return;
  personalChatFetchHint.textContent = text;
  personalChatFetchHint.style.color = color;
}

function setGroupPickerOptions(groups) {
  if (!groupPicker) return;

  const sortedGroups = [...groups].sort((a, b) => {
    const nameA = String(a?.name || 'Untitled').trim();
    const nameB = String(b?.name || 'Untitled').trim();
    return nameA.localeCompare(nameB, 'ms', { sensitivity: 'base', numeric: true });
  });

  const baseOption = '<option value="">Select a group...</option>';
  const optionHtml = sortedGroups
    .map((group) => {
      const safeId = String(group.id || '').replace(/"/g, '&quot;');
      const safeName = String(group.name || 'Untitled');
      return `<option value="${safeId}">${safeName}</option>`;
    })
    .join('');

  groupPicker.innerHTML = baseOption + optionHtml;
}

function setPersonalChatPickerOptions(chats) {
  if (!personalChatPicker) return;

  const sortedChats = [...chats].sort((a, b) => {
    const nameA = String(a?.name || a?.phoneNumber || a?.id || 'Unknown').trim();
    const nameB = String(b?.name || b?.phoneNumber || b?.id || 'Unknown').trim();
    return nameA.localeCompare(nameB, 'ms', { sensitivity: 'base', numeric: true });
  });

  const baseOption = '<option value="">Select a chat...</option>';
  const optionHtml = sortedChats
    .map((chat) => {
      const safeId = String(chat.id || '').replace(/"/g, '&quot;');
      const safeName = String(chat.name || chat.phoneNumber || chat.id || 'Unknown').trim();
      return `<option value="${safeId}">${safeName}</option>`;
    })
    .join('');

  personalChatPicker.innerHTML = baseOption + optionHtml;
}

async function loadGroups(force = false) {
  if (!groupPicker) return;
  if (hasLoadedGroups && !force) return;

  groupPicker.disabled = true;
  if (refreshGroupsBtn) setButtonLoading(refreshGroupsBtn, true, 'Refreshing groups');
  setGroupHint('Fetching group list...');

  try {
    const response = await fetch('/api/whatsapp/groups');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch groups');
    }

    const groups = Array.isArray(data.groups) ? data.groups : [];
    setGroupPickerOptions(groups);
    hasLoadedGroups = true;

    if (groups.length) {
      setGroupHint('Pick a group to auto-fill the ID.', '#136f63');
    } else {
      setGroupHint('No groups found on this account.', '#9f4f03');
    }
  } catch (error) {
    setGroupPickerOptions([]);
    setGroupHint(error.message, '#b42318');
  } finally {
    groupPicker.disabled = false;
    if (refreshGroupsBtn) {
      setButtonLoading(refreshGroupsBtn, false);
      refreshGroupsBtn.disabled = false;
    }
  }
}

async function loadPersonalChats(force = false) {
  if (!personalChatPicker) return;
  if (hasLoadedPersonalChats && !force) return;

  personalChatPicker.disabled = true;
  if (refreshPersonalChatsBtn) setButtonLoading(refreshPersonalChatsBtn, true, 'Refreshing chats');
  setPersonalChatHint('Fetching personal chats...');

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
      setPersonalChatHint('Pick a personal chat to auto-fill the destination ID.', '#136f63');
    } else {
      setPersonalChatHint('No personal chats found on this account.', '#9f4f03');
    }
  } catch (error) {
    setPersonalChatPickerOptions([]);
    setPersonalChatHint(error.message, '#b42318');
  } finally {
    personalChatPicker.disabled = false;
    if (refreshPersonalChatsBtn) {
      setButtonLoading(refreshPersonalChatsBtn, false);
      refreshPersonalChatsBtn.disabled = false;
    }
  }
}

if (targetTypeInput) {
  targetTypeInput.addEventListener('change', syncTargetInputContent);
}

if (groupPicker) {
  groupPicker.addEventListener('change', () => {
    const selected = String(groupPicker.value || '').trim();
    const targetValueInput = document.getElementById('publicTargetValue');
    if (!targetValueInput || !selected) return;
    targetValueInput.value = selected;
  });
}

if (personalChatPicker) {
  personalChatPicker.addEventListener('change', () => {
    const selected = String(personalChatPicker.value || '').trim();
    const targetValueInput = document.getElementById('publicTargetValue');
    if (!targetValueInput || !selected) return;
    targetValueInput.value = selected;
  });
}

if (refreshGroupsBtn) {
  refreshGroupsBtn.addEventListener('click', () => {
    loadGroups(true);
  });
}

if (refreshPersonalChatsBtn) {
  refreshPersonalChatsBtn.addEventListener('click', () => {
    loadPersonalChats(true);
  });
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
      const selectedSource = normalizeMediaSourceValue(tab.dataset.publicScheduleMediaSource || 'url');
      setScheduleMediaSource(selectedSource);
    });
  });
}

if (scheduleAddButtonRowBtn) {
  scheduleAddButtonRowBtn.addEventListener('click', () => addScheduleButtonRow());
}

initTheme();

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  });
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const repeatType = String(formData.get('repeatType') || 'none').trim();
    const repeatDays = formData
      .getAll('repeatDays')
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value));

    if (repeatType === 'weekly' && !repeatDays.length) {
      if (feedback) {
        feedback.textContent = 'Select at least one day for a weekly repeat schedule.';
        feedback.style.color = '#b42318';
      }
      return;
    }

    const selectedMediaType = String(formData.get('mediaType') || 'none').trim();
    const selectedMediaSource = String(formData.get('mediaSource') || 'url').trim();
    let mediaUrl = String(formData.get('mediaUrl') || '').trim();
    let fileName = String(formData.get('fileName') || '').trim();
    const rawScheduleAt = String(formData.get('scheduleAt') || '').trim();
    const normalizedScheduleAt = normalizeScheduleAtValue(repeatType, rawScheduleAt);

    const payload = {
      targetType: String(formData.get('targetType') || '').trim(),
      targetValue: String(formData.get('targetValue') || '').trim(),
      message: String(formData.get('message') || '').trim(),
      scheduleAt: normalizedScheduleAt,
      timezoneOffsetMinutes: getTimezoneOffsetMinutesForSchedule(normalizedScheduleAt, getSelectedTimeZone()),
      repeatType,
      repeatDays,
      mediaType: selectedMediaType,
      buttons: collectScheduleButtons(),
    };

    const hasButtons = Array.isArray(payload.buttons) && payload.buttons.length > 0;
    const hasMessage = Boolean(payload.message);
    const hasMedia = Boolean(selectedMediaType && selectedMediaType !== 'none');

    if (!repeatType || !payload.targetType || !payload.targetValue || !payload.scheduleAt || (!hasMessage && !hasMedia && !hasButtons)) {
      if (feedback) {
        feedback.textContent = 'Please provide target, schedule time, and at least one of message, media, or buttons.';
        feedback.style.color = '#b42318';
      }
      return;
    }

    if (feedback) {
      feedback.textContent = 'Saving schedule...';
      feedback.style.color = '#5d645d';
    }
    setButtonLoading(submitBtn, true, 'Saving schedule');

    try {
      if (selectedMediaType && selectedMediaType !== 'none' && selectedMediaSource === 'upload') {
        const selectedFile = scheduleMediaUploadInput?.files?.[0];
        if (selectedFile) {
          if (feedback) feedback.textContent = 'Uploading media file...';
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

      if (feedback) feedback.textContent = 'Saving schedule...';

      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create schedule');
      }

      if (feedback) {
        feedback.textContent = 'Schedule created successfully.';
        feedback.style.color = '#136f63';
      }
      form.reset();
      if (scheduleButtonRows) {
        scheduleButtonRows.innerHTML = '';
      }
      updateScheduleRepeatFlow();
      updateScheduleFormFlow();
    } catch (error) {
      if (feedback) {
        feedback.textContent = error.message;
        feedback.style.color = '#b42318';
      }
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}
