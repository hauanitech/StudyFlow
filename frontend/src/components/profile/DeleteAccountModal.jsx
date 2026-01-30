import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../ui';

export default function DeleteAccountModal({ isOpen, onClose, onConfirm, preview, isDeleting }) {
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState(1);

  const handleClose = useCallback(() => {
    setConfirmText('');
    setStep(1);
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(async () => {
    if (confirmText !== 'DELETE') return;
    await onConfirm();
    handleClose();
  }, [confirmText, onConfirm, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform rounded-xl bg-surface-800 p-6 shadow-xl transition-all">
          {/* Step 1: Preview */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-900/30">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Delete Account
                  </h3>
                  <p className="text-sm text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              {preview && (
                <div className="space-y-4 mb-6">
                  <div className="bg-red-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-300 mb-2">
                      Will be permanently deleted:
                    </h4>
                    <ul className="text-sm text-red-400 space-y-1">
                      <li>• Your profile and account</li>
                      {preview.willBeDeleted.journalEntries > 0 && (
                        <li>• {preview.willBeDeleted.journalEntries} journal entries</li>
                      )}
                      {preview.willBeDeleted.friendRequests > 0 && (
                        <li>• {preview.willBeDeleted.friendRequests} friend requests</li>
                      )}
                      {preview.willBeDeleted.friendships > 0 && (
                        <li>• {preview.willBeDeleted.friendships} friendships</li>
                      )}
                    </ul>
                  </div>

                  {(preview.willBeAnonymized.chatMessages > 0 || 
                    preview.willBeAnonymized.questions > 0 || 
                    preview.willBeAnonymized.answers > 0) && (
                    <div className="bg-amber-900/20 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-amber-300 mb-2">
                        Will be anonymized (content preserved):
                      </h4>
                      <ul className="text-sm text-amber-400 space-y-1">
                        {preview.willBeAnonymized.chatMessages > 0 && (
                          <li>• {preview.willBeAnonymized.chatMessages} chat messages</li>
                        )}
                        {preview.willBeAnonymized.questions > 0 && (
                          <li>• {preview.willBeAnonymized.questions} questions</li>
                        )}
                        {preview.willBeAnonymized.answers > 0 && (
                          <li>• {preview.willBeAnonymized.answers} answers</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => setStep(2)} className="flex-1">
                  Continue
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Final Confirmation
                </h3>
                <p className="text-sm text-gray-400">
                  Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm account deletion.
                </p>
              </div>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="Type DELETE"
                className="w-full px-3 py-2 rounded-lg border border-surface-600 bg-surface-800 text-white mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                autoComplete="off"
              />

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  variant="danger" 
                  onClick={handleConfirm} 
                  disabled={confirmText !== 'DELETE' || isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? 'Deleting...' : 'Delete My Account'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

DeleteAccountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  preview: PropTypes.shape({
    willBeDeleted: PropTypes.shape({
      journalEntries: PropTypes.number,
      friendRequests: PropTypes.number,
      friendships: PropTypes.number,
    }),
    willBeAnonymized: PropTypes.shape({
      chatMessages: PropTypes.number,
      questions: PropTypes.number,
      answers: PropTypes.number,
    }),
  }),
  isDeleting: PropTypes.bool,
};
