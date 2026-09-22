import Review from "./review";
export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) { return <Review id={(await params).id} />; }
