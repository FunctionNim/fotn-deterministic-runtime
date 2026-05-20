namespace FOTN.Engine.Functions;

public interface IFunctionRelationshipRegistry
{
    FunctionRelationshipSnapshot Get(string functionId);
}
