
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const UserProfilePage = () => (
    <div className="container flex items-center justify-center py-12">
        <Card>
            <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>This is a placeholder for the user profile page.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>User settings and profile information will be displayed here.</p>
            </CardContent>
        </Card>
    </div>
);

export default UserProfilePage;
