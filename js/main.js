/**
 * ResumeGlow — js/main.js
 * Alpine.js application controller.
 * Manages all state, user interactions, auto-save, and wires
 * together the renderer, ATS optimizer, story rewriter, and PDF exporter.
 */

function resumeApp() {
  return {
    /* ═══════════════════════════════════════
       STATE
    ═══════════════════════════════════════ */
    showLanding: true,
    isDark: true,
    activePanel: 'editor',
    previewZoom: 0.85,

    // Resume data (live-bound to editor)
    resumeData: null,
    currentResumeId: null,

    // Template & style
    selectedTemplate: 'modern',
    templates: TEMPLATES,
    accentColors: ACCENT_COLORS,

    // Section visibility toggles
    sectionVisibility: deepClone(DEFAULT_SECTIONS),

    // Editor accordion state
    openSections: {
      personal: true,
      summary: true,
      experience: true,
      education: false,
      skills: false,
      projects: false,
      certs: false,
      languages: false
    },

    // Live preview HTML
    renderedResume: '',

    // ATS
    atsScore: 0,
    atsChecks: [],

    // Job Description Analyzer
    jobDescription: '',
    jdAnalysis: null,
    analyzingJD: false,

    // Story Mode
    storyModeOpen: false,
    storyJobIdx: -1,
    storyJobTitle: '',
    storyBullets: [],
    storyResult: null,
    storyLoading: false,

    // PDF export
    pdfExporting: false,

    // Multi-resume manager
    savedResumes: [],
    showResumePicker: false,

    // Auto-save
    lastSaved: '',
    _saveTimer: null,
    _lastSaveDate: null,

    // Toast
    toast: { visible: false, message: '', emoji: '✓' },
    _toastTimer: null,

    /* ═══════════════════════════════════════
       INIT
    ═══════════════════════════════════════ */
    init() {
      // Load theme preference
      const savedTheme = storage.get('rg_theme');
      this.isDark = savedTheme !== 'light';
      this.applyTheme();

      // Load saved resumes list
      this.loadResumeList();

      // Load last active resume or create sample
      const lastId = storage.get('rg_last_resume');
      if (lastId) {
        const loaded = this.loadResumeById(lastId);
        if (!loaded) this.initFreshResume();
      } else {
        this.initFreshResume();
      }

      // Watch resume data for live preview
      this.$watch('resumeData', debounce(() => this.renderPreview(), 80), { deep: true });
      this.$watch('selectedTemplate', () => this.renderPreview());
      this.$watch('sectionVisibility', () => this.renderPreview(), { deep: true });

      // Initial render
      this.$nextTick(() => {
        this.renderPreview();
        this.refreshATS();
      });
    },

    initFreshResume() {
      // Use sample resume for demo feel
      this.resumeData = createSampleResume();
      this.currentResumeId = this.resumeData.id;
      this.selectedTemplate = 'modern';
      this.saveCurrentResume(true);
    },

    /* ═══════════════════════════════════════
       THEME
    ═══════════════════════════════════════ */
    toggleDark() {
      this.isDark = !this.isDark;
      this.applyTheme();
      storage.set('rg_theme', this.isDark ? 'dark' : 'light');
    },

    applyTheme() {
      if (this.isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.body.classList.remove('light');
        document.body.style.backgroundColor = '#0a0a0a';
        document.body.style.color = '#f5f5f5';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.body.classList.add('light');
        document.body.style.backgroundColor = '#fafaf9';
        document.body.style.color = '#1a1a1a';
      }
    },

    /* ═══════════════════════════════════════
       NAVIGATION
    ═══════════════════════════════════════ */
    startBuilding() {
      this.showLanding = false;
      this.activePanel = 'editor';
      this.$nextTick(() => this.renderPreview());
    },

    selectTemplateAndStart(templateId) {
      this.selectedTemplate = templateId;
      if (this.resumeData) this.resumeData.accentColor = TEMPLATES.find(t => t.id === templateId)?.accent || '#d4852a';
      this.startBuilding();
    },

    scrollToTemplates() {
      document.getElementById('template-gallery')?.scrollIntoView({ behavior: 'smooth' });
    },

    /* ═══════════════════════════════════════
       LIVE PREVIEW
    ═══════════════════════════════════════ */
    renderPreview() {
      if (!this.resumeData) return;
      try {
        // Inject accent CSS variable onto preview root
        this.renderedResume = renderResume(
          this.resumeData,
          this.selectedTemplate,
          this.sectionVisibility
        );
        // Update CSS var on the preview container
        const el = document.getElementById('resume-preview');
        if (el) el.style.setProperty('--accent', this.resumeData.accentColor || '#d4852a');
      } catch (e) {
        console.error('Render error:', e);
      }
    },

    /* ═══════════════════════════════════════
       SECTION ACCORDION
    ═══════════════════════════════════════ */
    toggleSection(key) {
      this.openSections[key] = !this.openSections[key];
    },

    /* ═══════════════════════════════════════
       EDITOR HELPERS
    ═══════════════════════════════════════ */
    uploadPhoto(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.resumeData.photo = e.target.result;
        this.autoSave();
      };
      reader.readAsDataURL(file);
    },

    addJob() {
      this.resumeData.experience.push({
        id: uid(),
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        bullets: ['']
      });
      this.autoSave();
    },

    removeJob(idx) {
      this.resumeData.experience.splice(idx, 1);
      this.autoSave();
    },

    addBullet(jobIdx) {
      this.resumeData.experience[jobIdx].bullets.push('');
      this.autoSave();
    },

    removeBullet(jobIdx, bulletIdx) {
      this.resumeData.experience[jobIdx].bullets.splice(bulletIdx, 1);
      this.autoSave();
    },

    addEducation() {
      this.resumeData.education.push({
        id: uid(),
        degree: '',
        school: '',
        year: '',
        gpa: ''
      });
      this.autoSave();
    },

    addProject() {
      this.resumeData.projects.push({
        id: uid(),
        name: '',
        link: '',
        description: '',
        tech: ''
      });
      this.autoSave();
    },

    addSkill(event) {
      const val = event.target.value.replace(/,+$/, '').trim();
      if (!val) return;
      // Handle comma-separated paste
      const parts = val.split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach(p => {
        if (!this.resumeData.skills.includes(p)) {
          this.resumeData.skills.push(p);
        }
      });
      event.target.value = '';
      this.autoSave();
    },

    addSkillFromJD(skill) {
      if (!this.resumeData.skills.includes(skill)) {
        this.resumeData.skills.push(skill);
        this.autoSave();
        this.showToast(`"${skill}" added to your skills ✓`, '⚡');
        // Refresh JD analysis
        if (this.jobDescription) this.analyzeJD();
      }
    },

    /* ═══════════════════════════════════════
       STORY MODE
    ═══════════════════════════════════════ */
    storyMode(jobIdx) {
      const job = this.resumeData.experience[jobIdx];
      if (!job) return;
      this.storyJobIdx = jobIdx;
      this.storyJobTitle = job.title || 'Position';
      this.storyBullets = (job.bullets || []).filter(b => b.trim());
      this.storyResult = null;
      this.storyLoading = false;
      this.storyModeOpen = true;
    },

    async runStoryMode() {
      if (!this.storyBullets.length) return;
      this.storyLoading = true;
      this.storyResult = null;

      try {
        const job = this.resumeData.experience[this.storyJobIdx];
        const rewritten = await rewriteBulletsWithAI(
          this.storyBullets,
          job?.title || '',
          job?.company || ''
        );
        this.storyResult = rewritten;
      } catch (err) {
        this.showToast('Story Mode failed — try again', '⚠️');
      } finally {
        this.storyLoading = false;
      }
    },

    applyStoryResult() {
      if (!this.storyResult || this.storyJobIdx < 0) return;
      this.resumeData.experience[this.storyJobIdx].bullets = this.storyResult;
      this.storyModeOpen = false;
      this.autoSave();
      this.showToast('Story Mode applied! ✦', '✨');
    },

    /* ═══════════════════════════════════════
       SUMMARY REWRITE
    ═══════════════════════════════════════ */
    async rewriteSummary() {
      this.showToast('Rewriting summary…', '✦');
      try {
        const newSummary = await rewriteSummaryWithAI(
          this.resumeData.summary,
          this.resumeData.name,
          this.resumeData.title
        );
        this.resumeData.summary = newSummary;
        this.autoSave();
        this.showToast('Summary rewritten!', '✨');
      } catch {
        this.showToast('Rewrite failed — try again', '⚠️');
      }
    },

    /* ═══════════════════════════════════════
       ATS OPTIMIZER
    ═══════════════════════════════════════ */
    refreshATS() {
      if (!this.resumeData) return;
      const result = runATSAnalysis(this.resumeData);
      this.atsScore = result.score;
      this.atsChecks = result.checks;
    },

    /* ═══════════════════════════════════════
       JOB DESCRIPTION ANALYZER
    ═══════════════════════════════════════ */
    analyzeJD() {
      if (!this.jobDescription.trim()) return;
      this.analyzingJD = true;
      this.jdAnalysis = null;

      // Simulate async for UX (analysis is sync but feels better with brief delay)
      setTimeout(() => {
        try {
          this.jdAnalysis = analyzeJobDescription(this.jobDescription, this.resumeData);
        } catch (err) {
          this.showToast('Analysis failed — try again', '⚠️');
        } finally {
          this.analyzingJD = false;
        }
      }, 600);
    },

    /* ═══════════════════════════════════════
       PDF EXPORT
    ═══════════════════════════════════════ */
    async exportPDF() {
      if (this.pdfExporting) return;
      this.pdfExporting = true;
      this.showToast('Preparing your PDF…', '📄');

      try {
        const fileName = suggestFileName(this.resumeData);
        await exportResumePDF(fileName);
        this.showToast('PDF exported successfully!', '🎉');
      } catch (err) {
        console.error('PDF export error:', err);
        this.showToast('PDF export failed — try again', '⚠️');
      } finally {
        this.pdfExporting = false;
      }
    },

    /* ═══════════════════════════════════════
       PERSISTENCE (localStorage)
    ═══════════════════════════════════════ */
    autoSave() {
      clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(() => {
        this.saveCurrentResume();
        this.refreshATS();
      }, 600);
    },

    saveCurrentResume(silent = false) {
      if (!this.resumeData) return;

      const snapshot = {
        ...deepClone(this.resumeData),
        id: this.currentResumeId,
        template: this.selectedTemplate,
        sectionVisibility: deepClone(this.sectionVisibility),
        updatedAt: Date.now()
      };

      storage.set(`rg_resume_${this.currentResumeId}`, snapshot);

      // Update list index
      const list = storage.get('rg_resume_list') || [];
      const existing = list.findIndex(r => r.id === this.currentResumeId);
      const meta = {
        id: this.currentResumeId,
        name: this.resumeData.name || 'Untitled Resume',
        updatedAt: formatDate(Date.now())
      };
      if (existing >= 0) list[existing] = meta;
      else list.unshift(meta);
      storage.set('rg_resume_list', list);
      storage.set('rg_last_resume', this.currentResumeId);

      this.savedResumes = list;
      this._lastSaveDate = new Date();

      if (!silent) {
        this.lastSaved = timeAgo(this._lastSaveDate);
        // Update time display every minute
        clearInterval(this._saveInterval);
        this._saveInterval = setInterval(() => {
          if (this._lastSaveDate) this.lastSaved = timeAgo(this._lastSaveDate);
        }, 30000);
      }
    },

    loadResumeList() {
      this.savedResumes = storage.get('rg_resume_list') || [];
    },

    loadResumeById(id) {
      const data = storage.get(`rg_resume_${id}`);
      if (!data) return false;

      this.resumeData = data;
      this.currentResumeId = id;
      this.selectedTemplate = data.template || 'modern';
      if (data.sectionVisibility) this.sectionVisibility = data.sectionVisibility;
      this.$nextTick(() => { this.renderPreview(); this.refreshATS(); });
      return true;
    },

    loadResume(id) {
      this.loadResumeById(id);
    },

    createNewResume() {
      const r = createBlankResume();
      this.resumeData = r;
      this.currentResumeId = r.id;
      this.selectedTemplate = 'modern';
      this.sectionVisibility = deepClone(DEFAULT_SECTIONS);
      this.jdAnalysis = null;
      this.jobDescription = '';
      this.saveCurrentResume(true);
      this.showResumePicker = false;
      this.showLanding = false;
      this.$nextTick(() => this.renderPreview());
      this.showToast('New resume created!', '✨');
    },

    deleteResume(id) {
      storage.remove(`rg_resume_${id}`);
      const list = (storage.get('rg_resume_list') || []).filter(r => r.id !== id);
      storage.set('rg_resume_list', list);
      this.savedResumes = list;
      if (this.currentResumeId === id) {
        if (list.length > 0) {
          this.loadResumeById(list[0].id);
        } else {
          this.initFreshResume();
        }
      }
      this.showToast('Resume deleted', '🗑️');
    },

    /* ═══════════════════════════════════════
       TOAST NOTIFICATIONS
    ═══════════════════════════════════════ */
    showToast(message, emoji = '✓') {
      clearTimeout(this._toastTimer);
      this.toast = { visible: true, message, emoji };
      this._toastTimer = setTimeout(() => {
        this.toast.visible = false;
      }, 3000);
    }
  };
}
