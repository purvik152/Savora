
import { UserProfile } from "@clerk/nextjs";

const UserProfilePage = () => (
    <div className="container flex items-center justify-center py-12">
        <UserProfile path="/user-profile" />
    </div>
);

export default UserProfilePage;
