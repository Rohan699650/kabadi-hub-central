import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Info as InfoIcon,
  BookOpen,
  Code,
  Download,
  Edit,
  Save,
  X,
  Server,
  Database,
  Shield,
  Smartphone,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function Info() {
  const navigate = useNavigate();
  const [editingSOPs, setEditingSOPs] = useState(false);
  const [sopsContent, setSOPsContent] = useState(`# Standard Operating Procedures

## Order Processing
1. All new orders must be assigned within 30 minutes of creation
2. Partners should be assigned based on area coverage and current workload
3. If a partner rejects an order, reassign immediately to the next available partner

## Invoice Approval
1. Verify all material quantities match the photos provided
2. Ensure rates match the current pricing table
3. Commission calculation must be positive before approval
4. Rejected invoices require a detailed reason

## Partner Management
1. All documents must be verified before activation
2. Partners with ratings below 3.5 should be reviewed
3. Wallet balance below ₹500 triggers low balance alert

## Customer Support
1. Respond to customer queries within 4 hours
2. Cancellation requests must include a valid reason
3. Refunds should be processed within 48 hours

## Data Handling
1. Export reports weekly for backup
2. Review completed orders move to history after 24 hours
3. Maintain customer privacy - no sharing of personal data`);

  const handleSaveSOPs = () => {
    toast.success('SOPs updated successfully');
    setEditingSOPs(false);
  };

  const handleDownloadSOPs = () => {
    const blob = new Blob([sopsContent], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kabadi-man-sops.md';
    a.click();
    toast.success('SOPs downloaded');
  };

  const techStack = [
    { name: 'React', version: '18.3', category: 'Frontend', icon: Code },
    { name: 'TypeScript', version: '5.x', category: 'Language', icon: Code },
    { name: 'Tailwind CSS', version: '3.x', category: 'Styling', icon: Code },
    { name: 'React Router', version: '6.x', category: 'Routing', icon: Code },
    { name: 'Tanstack Query', version: '5.x', category: 'Data', icon: Database },
    { name: 'Recharts', version: '2.x', category: 'Charts', icon: Code },
    { name: 'Shadcn/ui', version: 'Latest', category: 'Components', icon: Code },
    { name: 'Vite', version: '5.x', category: 'Build', icon: Server },
  ];

  return (
    <AdminLayout onLogout={() => navigate('/login')}>
      <div className="space-y-6">
        <PageHeader
          title="Platform Information"
          description="SOPs, documentation, and technical details"
          breadcrumbs={[{ label: 'Info' }]}
        />

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sops">SOPs</TabsTrigger>
            <TabsTrigger value="tech">Tech Stack</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <InfoIcon className="h-5 w-5 text-primary" />
                  Platform Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-semibold mb-2">About Kabadi Man</h4>
                    <p className="text-sm text-muted-foreground">
                      Kabadi Man is a scrap pickup and recycling platform that connects customers
                      with pickup partners. This admin portal serves as the single source of truth
                      for all operations, replacing the previous Google Sheets CRM.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="font-semibold mb-2">Key Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Real-time order management</li>
                      <li>• Partner & customer management</li>
                      <li>• Invoice approval workflow</li>
                      <li>• Dynamic pricing control</li>
                      <li>• Comprehensive reporting</li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="text-center p-4 rounded-lg bg-primary/5">
                    <p className="text-3xl font-bold text-primary">v1.0</p>
                    <p className="text-sm text-muted-foreground">Version</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-success/5">
                    <p className="text-3xl font-bold text-success">99.9%</p>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-info/5">
                    <p className="text-3xl font-bold text-info">24/7</p>
                    <p className="text-sm text-muted-foreground">Availability</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-warning/5">
                    <p className="text-3xl font-bold text-warning">SSL</p>
                    <p className="text-sm text-muted-foreground">Security</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Server className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Hosted Platform</p>
                      <p className="text-sm text-muted-foreground">Cloud-based infrastructure</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                      <Shield className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold">Secure Access</p>
                      <p className="text-sm text-muted-foreground">Encrypted connections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                      <Smartphone className="h-6 w-6 text-info" />
                    </div>
                    <div>
                      <p className="font-semibold">Responsive Design</p>
                      <p className="text-sm text-muted-foreground">Works on all devices</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SOPs */}
          <TabsContent value="sops" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Standard Operating Procedures
                    </CardTitle>
                    <CardDescription>
                      Guidelines for platform operations
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadSOPs}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    {editingSOPs ? (
                      <>
                        <Button variant="outline" onClick={() => setEditingSOPs(false)}>
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button onClick={handleSaveSOPs}>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setEditingSOPs(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingSOPs ? (
                  <Textarea
                    value={sopsContent}
                    onChange={(e) => setSOPsContent(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <div className="rounded-lg border p-6 bg-muted/30">
                      <pre className="whitespace-pre-wrap text-sm">{sopsContent}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tech Stack */}
          <TabsContent value="tech" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Technology Stack
                </CardTitle>
                <CardDescription>
                  Technologies powering the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {techStack.map((tech) => (
                    <div
                      key={tech.name}
                      className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <tech.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{tech.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {tech.version}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{tech.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
