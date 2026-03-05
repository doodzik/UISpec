import { Screen } from '../schemas/screen.schema.js';
import { Node } from '../schemas/node.schema.js';

export interface CompiledScreen extends Screen {
  generatedAt: string;
}

export function compile(screen: Screen): CompiledScreen {
  return {
    ...screen,
    generatedAt: new Date().toISOString(),
  };
}

export interface Catalogs {
  uiIds: string[];
  routes: string[];
  fixtures: string[];
}

export function generateCatalogs(screens: CompiledScreen[]): Catalogs {
  const uiIds: string[] = [];
  const routes: string[] = [];
  const fixtures: string[] = ['normal', 'empty', 'longStrings', 'maxContent', 'rtl'];

  for (const screen of screens) {
    routes.push(...screen.routes);

    const screenId = screen.id;
    collectNodeIds(screen.modes['desktop']?.tree || [], screenId, uiIds);
  }

  return {
    uiIds,
    routes,
    fixtures,
  };
}

function collectNodeIds(nodes: Node[], screenId: string, uiIds: string[]): void {
  for (const node of nodes) {
    uiIds.push(`${screenId}/${node.id}`);
    if (node.children) {
      collectNodeIds(node.children, screenId, uiIds);
    }
  }
}
