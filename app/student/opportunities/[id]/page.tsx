import OpportunityDetail from "./opportunity-detail";

export default async function OpportunityDetailPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  return <OpportunityDetail opportunityId={id}/>;
}
