---
title: Creating an Entity-Component-System
date_published: 2020-9-25
authors:
    - matt-hall
tags:
    - csharp
    - cs
    - gamedev
draft: false
---

For one of my game programming classes at Ohio State I decided to implement an [Entity-Component-System (ECS)](https://en.wikipedia.org/wiki/Entity_component_system). A widely used pattern in game design, an ECS allows for a simpler gameobject pattern then polymorphism would. The reasons for this are discussed elsewhere[^1], this blog post is solely for implementation.


## Component
I'm covering Components before Entities as this is where the entire game is implemented.Components describe any behavior shared between many Entities. Examples include `Transform`, `Collider`, `Sprite`, `Script`, etc. I modelled my implemetation off of the [Unity](https://docs.unity3d.com/ScriptReference/GameObject.GetComponent.html) style of ECS, as that's what many game programmers are used to. The implementation of the `Component` base class is exceedingly simple:
```csharp
class Component
{
    public Entity entity;

    public virtual void Update(GameTime gameTime) { }
}
```
Each component type subsclasses `Component`. I'll include a `Transform` type below as an example:
```csharp
class Transform : Component
{
    public Vector2 position = Vector2.Zero;
    public Vector2 scale = Vector2.Zero;
    public float layerDepth = 0;
    public float rotation = 0;
}
```


## Entity
Entities are the class for any given "thing" in the scene. Your player, their weapon, the enemies, the walls, all are "entities" in this model. My `Entity` class starts with the properties below:

```csharp
class Entity
{
    public int ID { get; set; }

    List<Component> components = new List<Component>();

    ...
}
```
The ID could be a string or [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier), but an `int` will work just fine for the 2D sprite-based game I'm making in this class. The `components` property references all the behaviors an entity has. Let's add some methods to this class to add a `Component` to the `Entity`:
```csharp
class Entity
{
    ... // class properties

    public void AddComponent(Component component)
    {
        components.Add(component);
        component.entity = this;
        component.Init();
    }
}
```
This method is pretty self-explanatory, the tricky (generics) part is what comes next- retrieving components. But first, why would we need to retrieve components?

### Sidebar: Example Character Entity
If we are implementing a normal character, we'd subclass the `Entity` class and register components on it like so:
```csharp
class MyAwesomeCharacter : Entity 
{
    public MyAwesomeCharacter(Texture2D tex) 
    {
        // add a `Transform` component to store the character's position
        Transform transform = new Transform();
        transform.position = new Vector2(100, 100);
        AddComponent(transform);

        // add a `Sprite` component to store the character's texture
        Sprite sprite = new Sprite();
        sprite.texture = tex;
        AddComponent(Sprite); // Assume `Sprite : Component`
    }
}

```
Cool! Now we have a character that stores both a `Sprite` and a `Transform`. Now wouldn't it be cool if the `Sprite` could know where on the screen to draw by accessing the value of `Transform`? This is where generics come in.

### Retrieving Components
In our implementation of the `Sprite` component above, we'd like to be able to access the values of the attached Entity's `Transform` component. It is pertinent to mention that each `Entity` should have *only one of each type* of `Component`.
```csharp
class Sprite : Component
{
    Texture2D texture;

    public virtual void Update(GameTime gameTime) {
        // We'd like to do something like this:
        Transform t = GetComponent<Transform>();
        GameEngine.DrawSprite(texture, t.position); // assume the fictitious GameEngine class
    }
}
```
How would we implement this generic `GetComponent` call? It's actually not too bad using C# [generics](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/). See below:
```csharp
class Entity
{
    ... // class properties and AddComponent method

    public T GetComponent<T>() where T : Component
        {
            foreach (Component component in components)
            {
                if (component.GetType().Equals(typeof(T)))
                {
                    return (T)component;
                }
            }
            return null;
        }
}
```
This just magically *works*. Well, it's not magic, C# just has nice [reflection](https://en.wikipedia.org/wiki/Reflection_(computer_programming)) capabilities built in. This will allow *any component* to access *any other component* on the same Entity.

### Component Conclusion
We now have a class `Component` that we can use to make endless reusable components that may be useful for our entities, and these components can interact with each other seamlessly.

## System
There's one more part of ECS- the S. All game run in what's called a [game loop](https://gameprogrammingpatterns.com/game-loop.html), usually implemented as some sort of infinite while loop that runs every frame, updating the entire game logic then rendering to the screen. The `System` in ECS refers loosely to calling `Update` on each and every `Component` on each `Entity` in the scene. We could simply do the following:
```cs
foreach(Entity entity in scene) // assume scene is a list or something iterable
{
    foreach(Component component in entity.components)
    {
        component.Update(deltaTime)
    }
}
```
This works, but is *slow*. You of course won't run into any issues with this in a small game with 1000 objects or so but on a larger project with a couple extra orders of magnitude and this will begin to crawl.

### Sidebar: CPU Cache Misses
A [cache miss](https://en.wikipedia.org/wiki/CPU_cache#Cache_miss) can occur when the data referenced by an instruction isn't found in the CPU cache, so it has to be loaded from memory (this is sloooow). There are plenty[^2] [^3] of excellent presentations on why this is bad and how to address this issue, but the jist of it is that we need to store each type of `Component` in its own system. For example, when processing many collider components, the CPU can have them all in cache at once, instead of having the whole entity.

### System Class
To address the performance concerns of an ECS, we can do some object-oriented trickery. I created a `BaseSystem` class then subclassed said class for each type of `Component` I wish to support.

```cs
class BaseSystem<T> where T : Component
{
    protected static List<T> components = new List<T>();

    public static void Register(T component)
    {
        components.Add(component);
    }

    public static void Update(GameTime gameTime)
    {
        foreach (T component in components)
        {
            component.Update(gameTime);
        }
    }
}

class TransformSystem : BaseTransform<Transform> { }
class SpriteSystem : BaseTransform<Sprite> { }
class ColliderSystem : BaseTransform<Collider> { }
```
Now, if we make a change to our component implementations:
```cs
class Transform : Component
{
    ... // properties

    public Transform() {
        TransformSystem.Register(this)
    }

    ... // methods
}
```
... we've allowed for the CPU to pull only the components it is processing.


## Addendum
<!-- The complete code for this Entity-Component-System can be found on [Github]() -->
Please let me know if there's anything I can do to improve this ECS implementation!

### Footnotes


[^1]: The fantastic article on ECS at [cowboyprogramming.com](http://cowboyprogramming.com/2007/01/05/evolve-your-heirachy/)

[^2]: Bob Nystrom's talk on the downsides of ECS and why cache misses need to be addressed [youtube.com](https://www.youtube.com/watch?v=JxI3Eu5DPwE)

[^3]: Elizabeth Baumel's talk for Unity on data-oriented design [youtube.com](https://www.youtube.com/watch?v=0_Byw9UMn9g)