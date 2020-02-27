import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import skillsfromfile from '../skills.json';

import * as $ from "jquery";

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.css']
})

export class PlannerComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  public skills: any = skillsfromfile;
  public skillSelected: any[] = [];
  public markedSkillborder = "3px solid red";
  public unmarkedSkillBorder = "3px solid ivory";
  public requiredSkillBorder = "3px solid green";

  ngOnInit() {
    this.BuildSkillTrees();

    this.router.events.subscribe(event =>{
      if (event instanceof NavigationEnd){
        this.routerChangeMethod(event.url);
      }
      })
    let id = this.route.snapshot.paramMap.get('id');
    if (id){
      this.PopulateTrees(id.toString())
    }
  }

  routerChangeMethod(url: string){
    let id = this.route.snapshot.paramMap.get('id');
    if (id){
      this.PopulateTrees(id.toString());
      this.ShowNotifications();
      this.UpdateRequiredLevel();
    }
  }

  PopulateTrees(classname: string){
    this.ClearTrees();
    
    let currentClassArray = this.GetCurrentClass(classname);

    for (let treenr in currentClassArray.tree)
    {
      let currenttree = currentClassArray.tree[treenr];
      if (currenttree.name)
      {
        $(".tree" + treenr).html(currenttree.name);
        for (let spellnr in currentClassArray.tree[treenr].spell)
        {
          let currentspell = currentClassArray.tree[treenr].spell[spellnr];
          let number = Math.floor(currentspell.levelreq/2) + currentspell.position;
          let gridnumber = "" + treenr + number;
          $("." + gridnumber).css("background-color", "rgba(31, 31, 31, 0.8)");
          $("." + gridnumber).prop('disabled', false);
          $("." + gridnumber).html(currentspell.name);
          $("." + gridnumber).attr("id", currentspell.id);
          this.BuildNotificationIcons(currentspell.id);
          $("." + gridnumber).css("border", this.unmarkedSkillBorder);
          $("." + gridnumber).css("cursor", "pointer");
        }
      }
    }
  }

  GetCurrentClass(classname: string): any
  {
    for (let xclass in this.skills)
    {
      if (this.skills[xclass].name == classname)
      {
        return this.skills[xclass];
      }
    }
  }

  ClearTrees()
  {
    for (let tree=0; tree<3; tree++)
    {
      for (let x=1; x<=18; x++)
      {
        let temp = "" + tree + x;
        $("." + temp).css("background-color", "black");
        $("." + temp).css("border", "1px solid");
        $("." + temp).css("cursor", "");
        $("." + temp).prop('disabled', true);
        $("." + temp).attr("id", "");
        $("." + temp).html("");
      }
    }
  }
  
  BuildNotificationIcons(gid: any)
  {
    if (document.getElementById(gid + "note"))
    {
      return;
    }
    let counterElement = document.createElement("span");
    counterElement.id=gid + "note";
    counterElement.style.zIndex = "100";
    counterElement.style.fontSize = "14px";
    counterElement.style.fontWeight = "bold";
    counterElement.style.color = "black";
    counterElement.style.borderRadius = "40%";
    counterElement.style.height = "18px";
    counterElement.style.width = "18px";
    counterElement.style.position = "absolute";
    counterElement.style.top = "5px";
    counterElement.style.right = "5px";
    counterElement.style.opacity = "0";
    counterElement.style.backgroundColor = "Red";
    let parentCounter = document.getElementById(gid);
    parentCounter?.appendChild(counterElement);
  }

  BuildSkillTrees()
  {
    for (let tree=0; tree<3; tree++)
    {
      for (let x=1; x<=18; x++)
      {
        let element = document.createElement("button");
        let temp = "" + tree + x;
        element.className=temp;
        element.style.zIndex = "1";
        element.id=temp;
        element.style.position = "relative";
        element.style.fontSize = "16px";
        element.style.marginBottom = "10px";
        element.style.color = "ivory";
        element.style.height = "65px";
        element.style.borderRadius = "4px";
        const that = this;

        element.oncontextmenu = (e) => {
          e.preventDefault();
          that.SkillClicked(e, e.button);
        };
        element.addEventListener("click", function(e) {
          that.SkillClicked(e, e.button);
        });
        let parent = document.getElementById("tree" + tree);
        parent?.appendChild(element);
      }
    }
    let parent = document.getElementById("selectedskill");

    let reqlevelElement = document.createElement("div");
    reqlevelElement.textContent = "Total Required level: 1";
    reqlevelElement.className = "totalRequiredLevelText";
    reqlevelElement.style.fontSize = "20px";
    reqlevelElement.style.position = "absolute";
    reqlevelElement.style.top = "40px";
    reqlevelElement.style.right = "5px";
    reqlevelElement.style.color = "ivory";
    parent?.appendChild(reqlevelElement);

    let element = document.createElement("button");
    const that = this;

    element.textContent = "Reset Skills";
    element.className = "resetbutton";
    element.style.fontSize = "20px";
    element.style.position = "absolute";
    element.style.top = "5px";
    element.style.right = "5px";
    element.addEventListener("click", function(e) {
      that.ResetSkills();
    });
    parent?.appendChild(element);
  }

  SkillClicked(e: any, button: number)
  {
    let addValue = 1;
    if (e.ctrlKey) { addValue *= 20 }
    if (button == 2) { addValue = addValue*-1; }

    let spellId = e.srcElement.id;

    let spellhandle = this.GetSpellHandleById(spellId);
    if (!spellId) { return; }

    if (e.srcElement.style.border == this.markedSkillborder || button == 2 || e.ctrlKey)
    {
      let skilladded = this.AddToSelectedSkill(spellId, addValue);
      if (skilladded)
      {
        if (button == 0) { this.AddPrerequisiteSkills(spellId); }
        this.UpdateNotification(skilladded);
      }
    }
    
    this.MarkClickedSkill(e.srcElement.className);
    this.MarkPrerequisite(spellhandle.prereq);
    this.UpdateSelectedSkillInfo(spellhandle)
    this.UpdateRequiredLevel();
  }

  UpdateSelectedSkillInfo(spellHandle: any)
  {

    $(".ssname").html("Name: " + spellHandle.name);
    $(".ssreqlevel").html("Required level: " + spellHandle.levelreq);
    let prereqString = this.GetSpellNamesById(spellHandle.prereq);
    $(".ssprereq").html("Requires: " + prereqString);
    let synergiesString = this.GetSpellNamesById(spellHandle.synergies);
    $(".sssynergies").html("Synergies: " + synergiesString);
    $(".ssdesc").html(spellHandle.desc);
  }

  AddPrerequisiteSkills(spellId: any)
  {
    if (!spellId) { return; }
    for (let x = 0; x < spellId.length; x += 2)
    {
      let singlePrerequisite = spellId.slice(x, x+2);
      let addedSkillHandle = this.GetAddedSkillHandle(singlePrerequisite)
      if (addedSkillHandle)
      {
        if (addedSkillHandle.level < 1)
        {
          let skillAdded = this.AddToSelectedSkill(singlePrerequisite, 1);
          this.UpdateNotification(skillAdded);
        }
      }
      else
      {
        this.skillSelected.push({ id: singlePrerequisite, level: 1});
        this.UpdateNotification(this.skillSelected[this.skillSelected.length-1]);
      }

      
      let prerequisiteSkillHandle = this.GetSpellHandleById(singlePrerequisite);
      if (prerequisiteSkillHandle)
      {
        this.AddPrerequisiteSkills(prerequisiteSkillHandle.prereq);
      }
    }
  }

  GetAddedSkillHandle(spellId: string)
  {
    for (let index in this.skillSelected)
    {
      if (this.skillSelected[index].id == spellId)
      {
        return this.skillSelected[index];
      }
    }
    return null
  }

  MarkClickedSkill(buttonId: string)
  {
    this.UnmarkSkills();
    $("." + buttonId).css("border", this.markedSkillborder)
  }

  UnmarkSkills()
  {
    $('[style*="border: ' + this.markedSkillborder + '"]').css("border", this.unmarkedSkillBorder)
    $('[style*="border: ' + this.requiredSkillBorder + '"]').css("border", this.unmarkedSkillBorder)
  }

  MarkPrerequisite(prerequisite: string)
  {
    if (prerequisite)
    {
      for (let x = 0; x < prerequisite.length; x += 2)
      {
        let singlePrerequisite = prerequisite.slice(x, x+2);
        $('#' + singlePrerequisite).css("border", this.requiredSkillBorder)
        let prerequisiteSkillHandle = this.GetSpellHandleById(singlePrerequisite);
        if (prerequisiteSkillHandle)
        {
          this.MarkPrerequisite(prerequisiteSkillHandle.prereq);
        }
      }
    }
  }
  
  ShowNotifications()
  {
    for (let index in this.skillSelected)
    {
      if (this.skillSelected[index].id)
      {
        this.UpdateNotification(this.skillSelected[index]);
      }
    }
  }

  ResetSkills()
  {
    for (let index in this.skillSelected)
    {
      if (this.skillSelected[index].id)
      {
        this.skillSelected[index].level = 0;
        this.UpdateNotification(this.skillSelected[index]);
      }
    }
    this.UpdateRequiredLevel();
  }

  UpdateNotification(nHandle: any)
  {
    $("#" + nHandle.id + "note").html(nHandle.level);
    if (nHandle.level > 0)
    {
      $("#" + nHandle.id + "note").css("opacity", "0.8");
    }
    else
    {
      $("#" + nHandle.id + "note").css("opacity", "0");
    }
  }

  UpdateRequiredLevel()
  {
    let requiredLevel = this.GetTotalRequiredLevel();
    $(".totalRequiredLevelText").text("Total required level: " + requiredLevel);
  }

  GetTotalRequiredLevel(): number
  {
    let currentClassName = this.router.url.replace("/planner/", "");
    let classIdentifier = [];

    let currentClassArray = this.GetCurrentClass(currentClassName);
    for (let index in currentClassArray.tree)
    {
      let identifier = currentClassArray.tree[index].spell[0].id;
      classIdentifier.push(identifier.replace("1", ""));
    }

    let requiredLevel = -11;
    for (let skill in this.skillSelected)
    {
      let skillId = this.skillSelected[skill].id.charAt(0);
      for (let index in classIdentifier)
      {
        if (skillId == classIdentifier[index])
        {
          requiredLevel += this.skillSelected[skill].level;
        }
      }
    }
    if (requiredLevel < 1 ) { requiredLevel = 1 }
    return requiredLevel;
  }

  AddToSelectedSkill(sid: string, addValue: number): any
  {
    let addedSkill = this.GetAddedSkillHandle(sid);
    if (addedSkill)
    {
      addedSkill.level += addValue;
    }
    else
    {
      this.skillSelected.push({ id: sid, level: addValue});
      addedSkill = this.skillSelected[this.skillSelected.length-1];
    }
    if (addedSkill.level > 19)
    {
      addedSkill.level = 20;
    }
    else if (addedSkill.level < 1)
    {
      addedSkill.level = 0;
    }
    return addedSkill;
  }

  GetSpellNamesById(sid: string): string
  {
    if (!sid || sid.length < 2) { return "";}
    let names = "";
    for (let x = 0; x < sid.length; x += 2)
    {
      names = names + this.GetSpellHandleById(sid.slice(x, x+2)).name + ", ";
    }
    return names;
  }

  GetSpellHandleById(sid: string): any
  {
    for (let xclass in this.skills)
    {
      for (let treenr in this.skills[xclass].tree)
      {
        for (let spellnr in this.skills[xclass].tree[treenr].spell)
        {
          let currentspell = this.skills[xclass].tree[treenr].spell[spellnr];
          if (currentspell.id == sid){
            return currentspell;
          }
        }
      }
    }
  }
}