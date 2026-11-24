import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import {
  TeacherSimulationDefinition,
  StudioSubject,
  StudioObject,
  StudioVariable,
  StudioFormula,
  StudioLogicRule,
  StudioGraph,
  Vector2D
} from '../types/simulationStudio.js';
import { STARTER_TEMPLATES } from '../data/studioTemplates.js';
import { ToolboxComponent } from '../data/subjectToolboxes.js';
import { SimulationRuntime } from '../engine/simulationRuntime.js';

// Studio Subcomponents
import { StudioHeader } from '../components/studio/StudioHeader.js';
import { ComponentToolbox } from '../components/studio/ComponentToolbox.js';
import { InteractiveCanvas } from '../components/studio/InteractiveCanvas.js';
import { PropertyInspector } from '../components/studio/PropertyInspector.js';
import { VisualLogicBuilder } from '../components/studio/VisualLogicBuilder.js';
import { SubjectSelectorModal } from '../components/studio/SubjectSelectorModal.js';
import { CustomComponentModal } from '../components/studio/CustomComponentModal.js';
import { AiSimulationModal } from '../components/studio/AiSimulationModal.js';
import { StudentSimulationPlayer } from '../components/studio/StudentSimulationPlayer.js';
import { useUser } from '../hooks/useUser.js';

export const SimulationStudioPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { authFetch, user } = useUser();

  // Search parameters for initial template or subject
  const params = new URLSearchParams(window.location.search);
  const initialSubject = (params.get('subject') as StudioSubject) || 'Physics';
  const initialTemplateId = params.get('template');

  // Load initial definition
  const getInitialDefinition = (): TeacherSimulationDefinition => {
    if (initialTemplateId) {
      const found = STARTER_TEMPLATES.find(t => t.id === initialTemplateId);
      if (found) return JSON.parse(JSON.stringify(found));
    }
    const subjectTemplate = STARTER_TEMPLATES.find(t => t.subject === initialSubject);
    if (subjectTemplate) return JSON.parse(JSON.stringify(subjectTemplate));
    return JSON.parse(JSON.stringify(STARTER_TEMPLATES[0]));
  };

  const [definition, setDefinition] = useState<TeacherSimulationDefinition>(getInitialDefinition);
  const [runtime] = useState(() => new SimulationRuntime(definition));
  const [runtimeState, setRuntimeState] = useState(() => runtime.getState());

  // History Stack for Undo / Redo
  const [history, setHistory] = useState<TeacherSimulationDefinition[]>([definition]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // UI Modals & Views
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isCustomCompModalOpen, setIsCustomCompModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to 60fps runtime updates
  useEffect(() => {
    const unsub = runtime.subscribe(() => {
      setRuntimeState({ ...runtime.getState() });
    });
    return unsub;
  }, [runtime]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Push new state to undo/redo history
  const pushHistory = useCallback((newDef: TeacherSimulationDefinition) => {
    setHistory(prev => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(JSON.parse(JSON.stringify(newDef)));
      if (next.length > 40) next.shift();
      return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 39));
    setDefinition(newDef);
    runtime.updateDefinition(newDef);
  }, [historyIndex, runtime]);

  // Undo / Redo Handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetDef = history[targetIndex];
      setHistoryIndex(targetIndex);
      setDefinition(targetDef);
      runtime.updateDefinition(targetDef);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetDef = history[targetIndex];
      setHistoryIndex(targetIndex);
      setDefinition(targetDef);
      runtime.updateDefinition(targetDef);
    }
  };

  // Subject Switcher / Starter Template Selection
  const handleSelectSubject = (subject: StudioSubject, templateId?: string) => {
    let newDef: TeacherSimulationDefinition;
    if (templateId) {
      const found = STARTER_TEMPLATES.find(t => t.id === templateId);
      newDef = found ? JSON.parse(JSON.stringify(found)) : JSON.parse(JSON.stringify(STARTER_TEMPLATES[0]));
    } else {
      // Create blank slate for selected subject
      newDef = {
        id: `sim_${Date.now()}`,
        title: `Custom ${subject} Simulation`,
        slug: `custom-${subject.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        description: `Interactive simulation for investigating core principles of ${subject}.`,
        subject,
        gradeLevel: '6-8',
        difficulty: 'Intermediate',
        authorId: 'user_teacher',
        authorName: 'Instructor',
        status: 'draft',
        version: '1.0.0',
        canvas: {
          width: 900,
          height: 520,
          background: '#0f172a',
          grid: true,
          gridSize: 30,
          snapToGrid: true,
          coordinateSystem: 'screen',
          showAxes: subject === 'Mathematics' || subject === 'Physics',
          origin: { x: 0, y: 0 },
          scale: 1.0
        },
        physics: {
          enabled: subject !== 'Computer Science',
          gravity: subject === 'Physics' ? { x: 0, y: 9.8 } : { x: 0, y: 0 },
          airResistance: 0.01,
          timeScale: 1.0,
          boundaryMode: 'bounce',
          enableCollisions: true
        },
        objects: [],
        variables: [],
        formulas: [],
        movements: [],
        reactions: [],
        logicRules: [],
        controls: [],
        graphs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    pushHistory(newDef);
    setIsSubjectModalOpen(false);
    showToast(`Switched to ${subject} Studio`);
  };

  // Add Component from Toolbox
  const handleAddComponent = (comp: ToolboxComponent) => {
    const objWidth = comp.width || comp.defaultWidth || 40;
    const objHeight = comp.height || comp.defaultHeight || 40;

    const newObj: StudioObject = {
      id: `obj_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: comp.name,
      subject: definition.subject,
      category: comp.category,
      shape: comp.shape,
      x: definition.canvas.width / 2 + (Math.random() * 60 - 30),
      y: definition.canvas.height / 2 + (Math.random() * 60 - 30),
      width: objWidth,
      height: objHeight,
      rotation: 0,
      scale: 1,
      opacity: 1,
      zIndex: definition.objects.length + 1,
      color: comp.defaultColor,
      borderColor: comp.borderColor || '#1e293b',
      borderWidth: 2,
      mass: comp.mass !== undefined ? comp.mass : 1,
      friction: comp.friction !== undefined ? comp.friction : 0.1,
      elasticity: comp.elasticity !== undefined ? comp.elasticity : 0.8,
      charge: comp.charge || 0,
      temperature: comp.temperature || 20,
      angularVelocity: 0,
      gravityScale: 1,
      isStatic: comp.isStatic || false,
      isDraggable: true,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      visible: true,
      showVectors: { velocity: false, acceleration: false },
      trail: { enabled: false, color: comp.defaultColor, maxPoints: 60 },
      subjectData: comp.subjectData ? JSON.parse(JSON.stringify(comp.subjectData)) : undefined,
      customProperties: comp.customProperties ? JSON.parse(JSON.stringify(comp.customProperties)) : []
    };

    const updatedDef = {
      ...definition,
      objects: [...definition.objects, newObj]
    };
    pushHistory(updatedDef);
    runtime.setSelectedObject(newObj.id);
    showToast(`Added ${comp.name} to canvas`);
  };

  // Drop component at specific canvas coordinate
  const handleDropNewComponent = (compJson: string, canvasPos: Vector2D) => {
    try {
      const comp: ToolboxComponent = JSON.parse(compJson);
      const objWidth = comp.width || comp.defaultWidth || 40;
      const objHeight = comp.height || comp.defaultHeight || 40;

      const newObj: StudioObject = {
        id: `obj_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: comp.name,
        subject: definition.subject,
        category: comp.category,
        shape: comp.shape,
        x: Math.round(canvasPos.x),
        y: Math.round(canvasPos.y),
        width: objWidth,
        height: objHeight,
        rotation: 0,
        scale: 1,
        opacity: 1,
        zIndex: definition.objects.length + 1,
        color: comp.defaultColor,
        borderColor: comp.borderColor || '#1e293b',
        borderWidth: 2,
        mass: comp.mass !== undefined ? comp.mass : 1,
        friction: comp.friction !== undefined ? comp.friction : 0.1,
        elasticity: comp.elasticity !== undefined ? comp.elasticity : 0.8,
        charge: comp.charge || 0,
        temperature: comp.temperature || 20,
        angularVelocity: 0,
        gravityScale: 1,
        isStatic: comp.isStatic || false,
        isDraggable: true,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        visible: true,
        showVectors: { velocity: false, acceleration: false },
        trail: { enabled: false, color: comp.defaultColor, maxPoints: 60 },
        subjectData: comp.subjectData ? JSON.parse(JSON.stringify(comp.subjectData)) : undefined,
        customProperties: comp.customProperties ? JSON.parse(JSON.stringify(comp.customProperties)) : []
      };

      const updatedDef = {
        ...definition,
        objects: [...definition.objects, newObj]
      };
      pushHistory(updatedDef);
      runtime.setSelectedObject(newObj.id);
      showToast(`Placed ${comp.name} at (${Math.round(canvasPos.x)}, ${Math.round(canvasPos.y)})`);
    } catch (e) {
      // safe ignore
    }
  };

  // Update an existing object
  const handleUpdateObject = (updated: StudioObject) => {
    const nextObjects = definition.objects.map(o => (o.id === updated.id ? updated : o));
    const nextDef = { ...definition, objects: nextObjects };
    setDefinition(nextDef);
    runtime.updateDefinition(nextDef);
  };

  // Delete an object
  const handleDeleteObject = (id: string) => {
    const nextObjects = definition.objects.filter(o => o.id !== id);
    const nextDef = { ...definition, objects: nextObjects };
    pushHistory(nextDef);
    runtime.setSelectedObject(null);
    showToast('Object deleted');
  };

  // Duplicate an object
  const handleDuplicateObject = (obj: StudioObject) => {
    const cloned: StudioObject = {
      ...JSON.parse(JSON.stringify(obj)),
      id: `obj_${Date.now()}`,
      name: `${obj.name} (Copy)`,
      x: obj.x + 30,
      y: obj.y + 30
    };
    const nextDef = { ...definition, objects: [...definition.objects, cloned] };
    pushHistory(nextDef);
    runtime.setSelectedObject(cloned.id);
    showToast('Object duplicated');
  };

  // Save Simulation Draft
  const handleSaveDraft = async () => {
    try {
      localStorage.setItem(`learnlab_studio_${definition.id}`, JSON.stringify(definition));

      const payload = {
        title: definition.title || 'Untitled Simulation Draft',
        simulationId: definition.id || `sim_${Date.now()}`,
        subject: definition.subject || 'Physics',
        grade: definition.gradeLevel || '6-8',
        difficulty: definition.difficulty || 'Exploratory',
        objective: definition.description || '',
        questions: definition.educationalGuide?.inquiryQuestions || [],
        templateId: 'free-exploration',
        configuration: {
          studioDefinition: definition
        },
        status: 'draft'
      };

      await authFetch('/api/teacher/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});

      showToast('Simulation draft saved successfully!');
    } catch (e) {
      showToast('Draft saved to local workspace.');
    }
  };

  // Submit Simulation for Review
  const handleSubmitForReview = async () => {
    if (!definition.title || !definition.title.trim()) {
      showToast('Please provide a title for your simulation before submitting.');
      return;
    }

    try {
      const payload = {
        title: definition.title,
        simulationId: definition.id || `sim_${Date.now()}`,
        subject: definition.subject || 'Physics',
        grade: definition.gradeLevel || '6-8',
        difficulty: definition.difficulty || 'Exploratory',
        objective: definition.description || definition.educationalGuide?.instructions || 'Interactive Simulation Studio Activity',
        questions: definition.educationalGuide?.inquiryQuestions || [],
        templateId: 'free-exploration',
        configuration: {
          studioDefinition: definition
        },
        status: 'submitted'
      };

      const res = await authFetch('/api/teacher/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit simulation for review.');
      }

      const submittedDef: TeacherSimulationDefinition = {
        ...definition,
        status: 'submitted'
      };
      pushHistory(submittedDef);
      showToast('Simulation submitted for curriculum review!');
    } catch (err: any) {
      console.error('Submit review error:', err);
      showToast(err.message || 'Error submitting simulation. Please ensure you are signed in as Teacher or Admin.');
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(definition, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${definition.title.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported simulation configuration JSON');
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.canvas && parsed.objects) {
            pushHistory(parsed);
            showToast(`Imported "${parsed.title}" successfully`);
          } else {
            showToast('Invalid simulation configuration format');
          }
        } catch (err) {
          showToast('Failed to parse JSON file');
        }
      };
    }
  };

  const selectedObject = definition.objects.find(o => o.id === runtimeState.selectedObjectId) || null;

  // Render Fullscreen Interactive Student Preview if active
  if (isPreviewMode) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950">
        <StudentSimulationPlayer
          definition={definition}
          onExitPreview={() => setIsPreviewMode(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full bg-slate-950 text-white overflow-hidden select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-2xl shadow-indigo-950 border border-indigo-400 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Top Header Controls */}
      <StudioHeader
        title={definition.title}
        subject={definition.subject}
        status={definition.status}
        isRunning={runtimeState.isRunning}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        speed={runtimeState.speed}
        isPreviewMode={isPreviewMode}
        onTitleChange={title => pushHistory({ ...definition, title })}
        onOpenSubjectModal={() => setIsSubjectModalOpen(true)}
        onPlay={() => runtime.play()}
        onPause={() => runtime.pause()}
        onReset={() => runtime.reset()}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSetSpeed={s => runtime.setSpeed(s)}
        onTogglePreview={() => setIsPreviewMode(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onSaveDraft={handleSaveDraft}
        onSubmitForReview={handleSubmitForReview}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />

      {/* Main Workspace Layout (Toolbox | Stage | Property Inspector) */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Component Toolbox */}
        <ComponentToolbox
          subject={definition.subject}
          onAddComponent={handleAddComponent}
          onOpenCustomComponentModal={() => setIsCustomCompModalOpen(true)}
        />

        {/* Center 60fps Interactive Canvas */}
        <InteractiveCanvas
          runtime={runtime}
          definition={definition}
          selectedObjectId={runtimeState.selectedObjectId}
          onSelectObject={id => runtime.setSelectedObject(id)}
          onUpdateObject={handleUpdateObject}
          onDropNewComponent={handleDropNewComponent}
        />

        {/* Floating Quick AI Sim Copilot Trigger */}
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="absolute bottom-4 right-[340px] z-30 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold shadow-xl shadow-indigo-950/80 border border-white/20 transition-all transform hover:scale-105 cursor-pointer backdrop-blur-md"
        >
          <span className="size-2 rounded-full bg-cyan-300 animate-ping" />
          <span>⚡ AI Sim Copilot</span>
        </button>

        {/* Right Contextual Property Inspector */}
        <PropertyInspector
          selectedObject={selectedObject}
          definition={definition}
          onUpdateObject={handleUpdateObject}
          onDeleteObject={handleDeleteObject}
          onDuplicateObject={handleDuplicateObject}
          onUpdateWorldSettings={newDef => pushHistory(newDef)}
        />
      </div>

      {/* Bottom Visual Logic & Formula Engine */}
      <VisualLogicBuilder
        logicRules={definition.logicRules}
        variables={definition.variables}
        formulas={definition.formulas}
        graphs={definition.graphs}
        objects={definition.objects}
        onUpdateRules={rules => pushHistory({ ...definition, logicRules: rules })}
        onUpdateVariables={vars => pushHistory({ ...definition, variables: vars })}
        onUpdateFormulas={forms => pushHistory({ ...definition, formulas: forms })}
        onUpdateGraphs={grs => pushHistory({ ...definition, graphs: grs })}
      />

      {/* Subject Chooser Dialog */}
      <SubjectSelectorModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSelectSubject={handleSelectSubject}
      />

      {/* Custom Component Creator Dialog */}
      <CustomComponentModal
        isOpen={isCustomCompModalOpen}
        subject={definition.subject}
        onClose={() => setIsCustomCompModalOpen(false)}
        onSaveComponent={handleAddComponent}
      />

      {/* AI Simulation Architect Generator Dialog */}
      <AiSimulationModal
        isOpen={isAiModalOpen}
        subject={definition.subject}
        currentDefinition={definition}
        onClose={() => setIsAiModalOpen(false)}
        onApplyGeneratedSimulation={gen => {
          pushHistory(gen);
          showToast(`Applied: ${gen.title}`);
        }}
      />
    </div>
  );
};
