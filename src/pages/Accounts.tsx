import { AccountManagement } from '../components/settings/AccountManagement';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import AddAccountDialog from '../components/accounts/AddAccountDialog';
import { useAccountStore } from '../stores/useAccountStore';

export default function Accounts() {
    const { addAccount, fetchAccounts } = useAccountStore();

    const handleAddAccount = async (email: string, refreshToken: string) => {
        await addAccount(email, refreshToken);
        await fetchAccounts();
    };

    return (
        <PageContainer className="overflow-hidden">
            <PageHeader
                title="Accounts"
                description="Manage your AI service accounts and quotas."
            >
                <AddAccountDialog onAdd={handleAddAccount} />
            </PageHeader>
            <div className="flex-1 overflow-hidden mb-6">
                <AccountManagement className="h-full" />
            </div>
        </PageContainer>
    );
}
