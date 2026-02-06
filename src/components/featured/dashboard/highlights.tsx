import { AlertTriangle, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Highlight = {
    type: "positive" | "negative" | "neutral";
    label: string;
    value: string;
    detail?: string;
};

type HighlightsProps = {
    highlights: Highlight[];
};

export function Highlights({ highlights }: HighlightsProps) {
    if (highlights.length === 0) {
        return null;
    }

    const getIcon = (type: Highlight["type"]) => {
        switch (type) {
            case "positive":
                return <Trophy className='size-4 text-green-500' />;
            case "negative":
                return <AlertTriangle className='size-4 text-orange-500' />;
            default:
                return <Target className='size-4 text-blue-500' />;
        }
    };

    return (
        <Card>
            <CardHeader className='pb-2'>
                <CardTitle className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                    <Trophy className='size-4' />
                    Destaques
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className='space-y-3'>
                    {highlights.map((highlight) => (
                        <div key={highlight.label} className='flex items-start gap-3'>
                            {getIcon(highlight.type)}
                            <div className='flex-1'>
                                <p className='text-sm'>
                                    <span className='text-muted-foreground'>
                                        {highlight.label}:
                                    </span>{" "}
                                    <span className='font-medium'>{highlight.value}</span>
                                </p>
                                {highlight.detail && (
                                    <p className='text-xs text-muted-foreground'>
                                        {highlight.detail}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
