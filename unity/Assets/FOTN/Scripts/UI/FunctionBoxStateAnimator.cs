using UnityEngine;
using UnityEngine.UIElements;

namespace FOTN.UI
{
    public sealed class FunctionBoxStateAnimator : MonoBehaviour
    {
        [SerializeField] private UIDocument document;
        [SerializeField] private float breatheSpeed = 0.8f;

        private VisualElement functionBox;
        private float time;

        private void Awake()
        {
            if (document == null)
            {
                document = GetComponent<UIDocument>();
            }

            functionBox = document.rootVisualElement.Q<VisualElement>("function-box");
        }

        private void Update()
        {
            if (functionBox == null) return;

            time += Time.deltaTime * breatheSpeed;
            var breathe = Mathf.Abs(Mathf.Sin(time));

            var slots = functionBox.Query<Button>(className: "function-slot").ToList();

            foreach (var slot in slots)
            {
                ApplySlotAnimation(slot, breathe);
            }
        }

        private static void ApplySlotAnimation(VisualElement slot, float breathe)
        {
            var intensity = ResolveSlotIntensity(slot);
            slot.style.opacity = Mathf.Clamp01(0.55f + breathe * intensity);
        }

        private static float ResolveSlotIntensity(VisualElement slot)
        {
            if (slot.ClassListContains("function-slot--fractured")) return 0.45f;
            if (slot.ClassListContains("function-slot--selected")) return 0.35f;
            if (slot.ClassListContains("function-slot--dragging")) return 0.4f;
            if (slot.ClassListContains("function-slot--hover")) return 0.25f;
            if (slot.ClassListContains("function-slot--restoring")) return 0.15f;
            if (slot.ClassListContains("function-slot--empty")) return 0.1f;
            return 0.2f;
        }
    }
}
