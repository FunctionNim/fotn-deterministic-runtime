using FOTN.Runtime.Components;
using Unity.Entities;
using UnityEngine;
using UnityEngine.UIElements;

namespace FOTN.UI
{
    public sealed class FunctionBoxUiBridge : MonoBehaviour
    {
        [SerializeField] private UIDocument document;

        private VisualElement root;
        private VisualElement functionBox;
        private Label sophiaLabel;

        private void Awake()
        {
            if (document == null)
            {
                document = GetComponent<UIDocument>();
            }

            root = document.rootVisualElement;
            functionBox = root.Q<VisualElement>("function-box");
            sophiaLabel = root.Q<Label>("sophia-label");
        }

        private void Update()
        {
            var world = World.DefaultGameObjectInjectionWorld;
            if (world == null) return;

            var entityManager = world.EntityManager;
            var query = entityManager.CreateEntityQuery(
                typeof(FunctionBoxManifestationComponent),
                typeof(SophiaTypographyComponent));

            if (query.IsEmpty) return;

            var entity = query.GetSingletonEntity();
            var manifestation = entityManager.GetComponentData<FunctionBoxManifestationComponent>(entity);
            var sophia = entityManager.GetComponentData<SophiaTypographyComponent>(entity);

            ApplyFunctionBoxState(manifestation);
            ApplySophiaState(sophia);
        }

        private void ApplyFunctionBoxState(FunctionBoxManifestationComponent manifestation)
        {
            if (functionBox == null) return;

            functionBox.style.opacity = manifestation.State switch
            {
                FunctionBoxManifestationState.Hidden => 0f,
                FunctionBoxManifestationState.Shimmer => 0.25f,
                FunctionBoxManifestationState.Manifesting => 0.6f,
                FunctionBoxManifestationState.Active => 1f,
                FunctionBoxManifestationState.Dissolving => 0.35f,
                _ => 0f,
            };

            functionBox.EnableInClassList(
                "function-box--active",
                manifestation.State == FunctionBoxManifestationState.Active);
        }

        private void ApplySophiaState(SophiaTypographyComponent sophia)
        {
            if (sophiaLabel == null) return;

            sophiaLabel.text = "Sophia";
            sophiaLabel.style.opacity = sophia.Visibility;
        }
    }
}
