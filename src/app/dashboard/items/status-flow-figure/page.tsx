'use client';

import { ITEM_STATUS } from '@/domain/static/static-config-mappers';
import { StatusFlow } from '@/StatusFlow';

import { FlowGraph } from '@/components/FlowGraph';

export default function Page() {
  const flow = structuredClone(StatusFlow.flow);

  for (const step of Object.values(flow)) {
    (step as unknown as { id: string }).id = step.status;
  }

  return (
    <FlowGraph
      flow={flow as any}
      startId={'SubmitAppraisalStatus' as ITEM_STATUS['key']}
      getMessage={(status) => ITEM_STATUS.get('key', status as ITEM_STATUS['key']).message}
      getValue={(status) => ITEM_STATUS.enum(status as any) as any}
    />
  );
}
