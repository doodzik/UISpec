import { Node, NodeKind, Semantics } from '../schemas/node.schema.js';
import { Screen, ScreenSchema, FlowStep } from '../schemas/screen.schema.js';

export function region(attrs: { id: string; children?: Node[]; semantics?: Semantics }): Node {
  return {
    id: attrs.id,
    kind: 'region' as NodeKind,
    children: attrs.children,
    semantics: attrs.semantics,
  };
}

export function component(attrs: { id: string; children?: Node[]; semantics?: Semantics }): Node {
  return {
    id: attrs.id,
    kind: 'component' as NodeKind,
    children: attrs.children,
    semantics: attrs.semantics,
  };
}

export function control(attrs: { id: string; children?: Node[]; semantics?: Semantics }): Node {
  return {
    id: attrs.id,
    kind: 'control' as NodeKind,
    children: attrs.children,
    semantics: attrs.semantics,
  };
}

export function container(attrs: { id: string; children?: Node[]; semantics?: Semantics }): Node {
  return {
    id: attrs.id,
    kind: 'container' as NodeKind,
    children: attrs.children,
    semantics: attrs.semantics,
  };
}

export function collection(attrs: { id: string; children?: Node[]; semantics?: Semantics }): Node {
  return {
    id: attrs.id,
    kind: 'collection' as NodeKind,
    children: attrs.children,
    semantics: attrs.semantics,
  };
}

export function overlayAnchor(attrs: {
  id: string;
  children?: Node[];
  semantics?: Semantics;
}): Node {
  return {
    id: attrs.id,
    kind: 'overlayAnchor' as NodeKind,
    children: attrs.children,
    semantics: attrs.semantics,
  };
}

type ScreenBuilder = {
  routes(_routes: string[]): ScreenBuilder;
  viewports(_viewports: Record<string, string>): ScreenBuilder;
  mode(_name: string, _builder: (mode: ModeBuilder) => void): ScreenBuilder;
  overlay(_name: string, _overlay: { id: string; route?: string; anchor: string }): ScreenBuilder;
  flow(_name: string, _steps: FlowStep[]): ScreenBuilder;
  invariant(_invariant: {
    id: string;
    description?: string;
    target: string;
    conditions: unknown[];
  }): ScreenBuilder;
};

type ModeBuilder = {
  tree(_nodes: Node[]): ModeBuilder;
};

interface ModeBuilderImpl {
  tree(_nodes: Node[]): ModeBuilderImpl;
  getTree(): Node[];
}

function createModeBuilder(): ModeBuilderImpl {
  let tree: Node[] = [];
  return {
    tree(_nodes: Node[]) {
      tree = _nodes;
      return this;
    },
    getTree() {
      return tree;
    },
  };
}

export function screen(id: string, builder: (_s: ScreenBuilder) => void): Screen {
  const screenData: Partial<Screen> = {
    id,
    routes: [],
    viewports: {},
    modes: {},
  };

  const screenBuilder: ScreenBuilder = {
    routes(routes: string[]) {
      screenData.routes = routes;
      return screenBuilder;
    },
    viewports(viewports) {
      screenData.viewports = viewports;
      return screenBuilder;
    },
    mode(modeName: string, builderFn: (mode: ModeBuilder) => void) {
      const modeBuilder = createModeBuilder();
      builderFn(modeBuilder);
      screenData.modes = {
        ...screenData.modes,
        [modeName]: { tree: modeBuilder.getTree() },
      };
      return screenBuilder;
    },
    overlay(name: string, overlayData) {
      screenData.overlays = {
        ...screenData.overlays,
        [name]: overlayData,
      };
      return screenBuilder;
    },
    flow(name: string, steps: FlowStep[]) {
      screenData.flows = {
        ...screenData.flows,
        [name]: steps,
      };
      return screenBuilder;
    },
    invariant(invariantData) {
      screenData.invariants = [...(screenData.invariants || []), invariantData];
      return screenBuilder;
    },
  };

  builder(screenBuilder);

  const result = ScreenSchema.parse(screenData);
  return result;
}
