export function toast(type: 'success' | 'failure', message: string) {
    const toastContainerId = 'toast-container';
    let toastContainer = document.getElementById(toastContainerId);

    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = toastContainerId;
        toastContainer.className = 'fixed bottom-5 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 pointer-events-none z-50'; // Tailwind classes for positioning and layout
        document.body.appendChild(toastContainer);
    }

    const baseToastClasses = 'toast px-4 py-2 rounded-md shadow-lg text-white opacity-0 transform translate-y-5 transition-opacity duration-300 ease-out transition-transform duration-300 ease-out pointer-events-auto';
    const showToastClasses = 'opacity-100 translate-y-0';

    const createToastElement = (message: string, type: 'success' | 'failure') => {
        const toastElement = document.createElement('div');
        toastElement.className = baseToastClasses;

        if (type === 'success') {
            toastElement.classList.add('bg-green-500');
        } else if (type === 'failure') {
            toastElement.classList.add('bg-red-500');
        } else {
            toastElement.classList.add('bg-gray-700');
        }

        toastElement.textContent = message;
        return toastElement;
    };

    ((message: string, type: 'success' | 'failure') => {
        if (!message) return;

        const toastElement = createToastElement(message, type);
        toastContainer?.appendChild(toastElement);

        void toastElement.offsetWidth;

        toastElement.classList.add(showToastClasses);

        const duration = 3000;

        setTimeout(() => {
            toastElement.classList.remove(showToastClasses);
            setTimeout(() => {
                toastElement.remove();
                if (toastContainer?.children.length === 0) {
                    toastContainer?.remove();
                }
            }, 300);
        }, duration);
    })(message, type);
}