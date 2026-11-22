import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const DashboardStatCard = ({ title, value, description, icon: Icon }) => {
  return (
    <Card className="border border-border/80 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        {Icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <Icon className="size-5" strokeWidth={1.8} />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {value ?? 0}
        </div>

        {description && (
          <CardDescription className="mt-1 text-xs">
            {description}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardStatCard;
